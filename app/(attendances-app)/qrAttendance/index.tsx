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
  // Estados para permisos y escáner
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flashOn, setFlashOn] = useState(false);

  // Solicitar permisos de cámara al montar el componente
  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      console.log('🔐 Solicitando permisos de cámara...');
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('📱 Estado de permisos:', status);

      setHasPermission(status === 'granted');
      setIsLoading(false);

      if (status !== 'granted') {
        Alert.alert(
          'Permisos de Cámara',
          'Necesitamos acceso a la cámara para escanear códigos QR. Por favor, habilita los permisos en la configuración de la aplicación.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => {
              // TODO: Abrir configuración de la app
              console.log('Abrir configuración de permisos');
            }}
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      setIsLoading(false);
      Alert.alert('Error', 'No se pudieron solicitar los permisos de cámara');
    }
  };

  // Función que se ejecuta cuando se escanea un código QR
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('📱 Código QR escaneado:', { type, data });

    Alert.alert(
      'Código QR Detectado',
      `Tipo: ${type}\nDatos: ${data}`,
      [
        {
          text: 'Escanear Otro',
          onPress: () => setScanned(false)
        },
        {
          text: 'Registrar Asistencia',
          onPress: () => handleAttendanceRegistration(data)
        }
      ]
    );
  };

  // Función para manejar el registro de asistencia
  const handleAttendanceRegistration = async (qrData: string) => {
    try {
      console.log('📝 Registrando asistencia con datos:', qrData);

      // TODO: Aquí implementarás el envío a tu API
      // const response = await attendancesApi.post('/attendance', { qrData });

      Alert.alert(
        'Asistencia Registrada',
        'Tu asistencia ha sido registrada correctamente.',
        [
          {
            text: 'Continuar',
            onPress: () => setScanned(false)
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error al registrar asistencia:', error);
      Alert.alert(
        'Error',
        'No se pudo registrar la asistencia. Intenta nuevamente.',
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
    requestCameraPermission();
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
        <Text style={styles.headerSubtitle}>Escanea el código QR para registrar tu asistencia</Text>
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
          Coloca el código QR dentro del marco para escanearlo
        </Text>
        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>Escanear Nuevamente</Text>
          </TouchableOpacity>
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
});

export default QRAttendanceScreen;