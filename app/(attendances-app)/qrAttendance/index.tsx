import { isValidQRCode, sanitizeQRCode } from '@/core/attendance/actions/attendanceActions';
import { useAttendanceStore } from '@/presentation/attendance/store/useAttendanceStore';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// const { width, height } = Dimensions.get('window'); // Para uso futuro

const QRAttendanceScreen = () => {
  // Store de asistencias
  const {
    status,
    error,
    userLocation,
    locationPermissionGranted,
    isLoadingLocation,
    isSubmittingAttendance,
    requestLocationPermission,
    getCurrentLocation,
    setScannedQRCode,
    submitAttendanceRecord,
    clearError,
    resetAttendanceFlow
  } = useAttendanceStore();

  // Estados locales para la cámara
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flashOn, setFlashOn] = useState(false);

  // Solicitar permisos de cámara y ubicación al montar el componente
  useEffect(() => {
    initializePermissions();
  }, []);

  const initializePermissions = async () => {
    try {
      console.log('🚀 Inicializando permisos y servicios...');

      // Reiniciar el flujo de asistencia
      resetAttendanceFlow();

      // Solicitar permisos de cámara
      console.log('🔐 Solicitando permisos de cámara...');
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('📱 Estado de permisos de cámara:', status);

      setHasPermission(status === 'granted');

      if (status === 'granted') {
        // Si la cámara fue autorizada, solicitar permisos de ubicación
        console.log('📍 Solicitando permisos de ubicación...');
        const locationGranted = await requestLocationPermission();

        if (locationGranted) {
          console.log('📍 Obteniendo ubicación inicial...');
          await getCurrentLocation();
        }
      } else {
        Alert.alert(
          'Permisos de Cámara Requeridos',
          'Necesitamos acceso a la cámara para escanear códigos QR. Por favor, habilita los permisos en la configuración de la aplicación.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => {
              console.log('Abrir configuración de permisos');
            }}
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error al inicializar permisos:', error);
      Alert.alert('Error', 'No se pudieron inicializar los permisos necesarios');
    } finally {
      setIsLoading(false);
    }
  };

  // Función que se ejecuta cuando se escanea un código QR
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('📱 Código QR escaneado:', { type, data });

    // Sanitizar y validar el código QR
    const cleanQRCode = sanitizeQRCode(data);

    if (!isValidQRCode(cleanQRCode)) {
      Alert.alert(
        'Código QR Inválido',
        'El código QR escaneado no tiene el formato correcto para eventos.',
        [
          {
            text: 'Escanear Otro',
            onPress: () => setScanned(false)
          }
        ]
      );
      return;
    }

    // Verificar que tenemos ubicación antes de proceder
    if (!userLocation) {
      Alert.alert(
        'Ubicación Requerida',
        'Necesitamos tu ubicación para registrar la asistencia. ¿Deseas intentar obtenerla nuevamente?',
        [
          {
            text: 'Cancelar',
            onPress: () => setScanned(false)
          },
          {
            text: 'Obtener Ubicación',
            onPress: async () => {
              const locationObtained = await getCurrentLocation();
              if (locationObtained) {
                handleAttendanceRegistration(cleanQRCode);
              } else {
                setScanned(false);
              }
            }
          }
        ]
      );
      return;
    }

    // Mostrar confirmación antes de registrar
    Alert.alert(
      'Confirmar Asistencia',
      `¿Deseas registrar tu asistencia para este evento?\n\nCódigo: ${cleanQRCode.substring(0, 8)}...`,
      [
        {
          text: 'Cancelar',
          onPress: () => setScanned(false)
        },
        {
          text: 'Registrar',
          onPress: () => handleAttendanceRegistration(cleanQRCode)
        }
      ]
    );
  };

  // Función para manejar el registro de asistencia
  const handleAttendanceRegistration = async (qrData: string) => {
    try {
      console.log('📝 Iniciando registro de asistencia con QR:', qrData);

      // Establecer el QR code en el store
      setScannedQRCode(qrData);

      // Enviar la asistencia usando el store
      const attendanceResult = await submitAttendanceRecord(qrData);

      if (attendanceResult) {
        // Mostrar éxito con detalles del evento
        Alert.alert(
          '✅ Asistencia Registrada',
          `Tu asistencia ha sido registrada exitosamente.\n\n` +
          `Evento: ${attendanceResult.event?.name || 'N/A'}\n` +
          `Distancia: ${Math.round(attendanceResult.distance_meters || 0)}m\n` +
          `Verificado: ${attendanceResult.verified ? 'Sí' : 'No'}`,
          [
            {
              text: 'Continuar',
              onPress: () => {
                setScanned(false);
                resetAttendanceFlow();
              }
            }
          ]
        );
      } else {
        // Mostrar error específico si está disponible
        const errorMessage = error?.message || 'No se pudo registrar la asistencia. Intenta nuevamente.';

        Alert.alert(
          '❌ Error al Registrar',
          errorMessage,
          [
            {
              text: 'Reintentar',
              onPress: () => setScanned(false)
            },
            {
              text: 'Cancelar',
              onPress: () => {
                setScanned(false);
                resetAttendanceFlow();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error inesperado al registrar asistencia:', error);
      Alert.alert(
        'Error Inesperado',
        'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        [
          {
            text: 'Reintentar',
            onPress: () => setScanned(false)
          }
        ]
      );
    }
  };

  // Función para alternar el flash
  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  // Función para solicitar permisos nuevamente
  const retryPermissions = () => {
    setIsLoading(true);
    initializePermissions();
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  // Pantalla cuando no hay permisos
  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={80} color="#9CA3AF" />
        <Text style={styles.noPermissionTitle}>Permisos de Cámara Requeridos</Text>
        <Text style={styles.noPermissionText}>
          Para escanear códigos QR y registrar tu asistencia, necesitamos acceso a la cámara.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryPermissions}>
          <Text style={styles.retryButtonText}>Solicitar Permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pantalla principal con escáner QR
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro de Asistencia</Text>
        <Text style={styles.headerSubtitle}>
          {isSubmittingAttendance
            ? 'Registrando asistencia...'
            : isLoadingLocation
            ? 'Obteniendo ubicación...'
            : !userLocation
            ? 'Ubicación requerida para continuar'
            : 'Escanea el código QR para registrar tu asistencia'
          }
        </Text>

        {/* Indicadores de estado */}
        {(isLoadingLocation || isSubmittingAttendance) && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.statusText}>
              {isSubmittingAttendance ? 'Registrando...' : 'Obteniendo ubicación...'}
            </Text>
          </View>
        )}

        {/* Indicador de ubicación */}
        {userLocation && (
          <View style={styles.locationIndicator}>
            <Ionicons name="location" size={16} color="#10B981" />
            <Text style={styles.locationText}>
              Ubicación: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {/* Mostrar errores */}
        {error && (
          <View style={styles.errorIndicator}>
            <Ionicons name="warning" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{error.message}</Text>
            <TouchableOpacity onPress={clearError} style={styles.clearErrorButton}>
              <Text style={styles.clearErrorText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Cámara con escáner */}
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        {/* Overlay con marco de escaneo */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Controles */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Ionicons
              name={flashOn ? "flash" : "flash-off"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer con instrucciones */}
      <View style={styles.footer}>
        <Text style={styles.instructionText}>
          {scanned
            ? 'Código QR detectado. Presiona el botón para escanear otro código.'
            : 'Coloca el código QR dentro del marco para escanearlo'
          }
        </Text>

        {scanned ? (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>Escanear Nuevamente</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.footerControls}>
            {/* Botón para obtener ubicación manualmente */}
            {!userLocation && !isLoadingLocation && (
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={isLoadingLocation}
              >
                <Ionicons name="location-outline" size={20} color="white" />
                <Text style={styles.locationButtonText}>Obtener Ubicación</Text>
              </TouchableOpacity>
            )}

            {/* Botón para reiniciar en caso de error */}
            {error && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  clearError();
                  initializePermissions();
                }}
              >
                <Ionicons name="refresh-outline" size={20} color="white" />
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  noPermissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  noPermissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1F2937',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3B82F6',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  controls: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: '#1F2937',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 16,
  },
  scanAgainButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Nuevos estilos para indicadores de estado
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  statusText: {
    color: '#10B981',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 6,
  },
  locationText: {
    color: '#10B981',
    fontSize: 12,
    marginLeft: 6,
    fontFamily: 'monospace',
  },
  errorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  clearErrorButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 4,
  },
  clearErrorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  // Estilos para controles del footer
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default QRAttendanceScreen;