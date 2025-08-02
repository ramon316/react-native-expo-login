import { PrintModal } from '@/components/print/PrintModal';
import { useEventStore } from '@/presentation/event/store/useEventStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const EventDetailsScreen = () => {
  // Obtener el ID del evento desde los parámetros de la ruta
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Store de eventos
  const { 
    currentEvent, 
    loadingStatus, 
    error, 
    fetchEventById,
    removeEvent 
  } = useEventStore();

  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const isLoading = loadingStatus === 'loading';

  // Cargar evento al montar el componente
  useEffect(() => {
    if (id) {
      loadEventDetails();
      generateQRImageUrl();
    }
  }, [id]);

  const loadEventDetails = async () => {
    if (!id) return;
    
    console.log('📋 Cargando detalles del evento:', id);
    await fetchEventById(parseInt(id));
  };

  const generateQRImageUrl = () => {
    if (!currentEvent?.qr_code) return;
    
    // Generar URL de imagen QR usando un servicio público
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentEvent.qr_code)}`;
    setQrImageUrl(qrUrl);
  };

  // Actualizar URL del QR cuando cambie el evento actual
  useEffect(() => {
    if (currentEvent?.qr_code) {
      generateQRImageUrl();
    }
  }, [currentEvent]);

  // Función para volver atrás
  const goBack = () => {
    router.push('/events');
  };

  // Función para abrir el modal de impresión
  const handlePrint = () => {
    if (currentEvent) {
      setShowPrintModal(true);
    }
  };

  // Función para eliminar evento
  const handleDeleteEvent = () => {
    if (!currentEvent) return;
    
    Alert.alert(
      'Eliminar Evento',
      `¿Estás seguro de que deseas eliminar el evento "${currentEvent.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: confirmDeleteEvent
        }
      ]
    );
  };

  const confirmDeleteEvent = async () => {
    if (!currentEvent) return;
    
    const success = await removeEvent(currentEvent.id);
    if (success) {
      Alert.alert('Éxito', 'Evento eliminado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'No se pudo eliminar el evento');
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para obtener el estado del evento
  const getEventStatus = () => {
    if (!currentEvent) return { status: 'unknown', label: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    
    const now = new Date();
    const start = new Date(currentEvent.start_time);
    const end = new Date(currentEvent.end_time);

    if (now < start) {
      return { status: 'upcoming', label: 'Próximo', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
      return { status: 'active', label: 'Activo', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'finished', label: 'Finalizado', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header con botón de regreso */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={goBack} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900">
              Detalles del Evento
            </Text>
          </View>
        </View>

        {/* Estado de carga */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-4">
            Cargando detalles del evento...
          </Text>
        </View>
      </View>
    );
  }

  // Renderizar estado de error
  if (error || !currentEvent) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header con botón de regreso */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={goBack} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900">
              Detalles del Evento
            </Text>
          </View>
        </View>

        {/* Estado de error */}
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
            Error al cargar evento
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            {error || 'No se pudo encontrar el evento solicitado'}
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg"
            onPress={loadEventDetails}
          >
            <Text className="text-white font-medium">
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const eventStatus = getEventStatus();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={goBack} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900" numberOfLines={1}>
              {currentEvent.name}
            </Text>
          </View>

          <View className="flex-row items-center space-x-2">
            {/* Botón Imprimir */}
            <TouchableOpacity
              onPress={handlePrint}
              className="p-2"
            >
              <Ionicons name="print-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>

            {/* Botón Eliminar */}
            <TouchableOpacity
              onPress={handleDeleteEvent}
              className="p-2"
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Contenido */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-6">
          {/* Estado del evento */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">
                Estado del Evento
              </Text>
              <View className={`px-3 py-1 rounded-full ${eventStatus.color}`}>
                <Text className="text-sm font-medium">
                  {eventStatus.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Información básica */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Información General
            </Text>
            
            <View className="space-y-4">
              {/* Nombre */}
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">
                  Nombre del Evento
                </Text>
                <Text className="text-base text-gray-900">
                  {currentEvent.name}
                </Text>
              </View>

              {/* Descripción */}
              {currentEvent.description && (
                <View>
                  <Text className="text-sm font-medium text-gray-500 mb-1">
                    Descripción
                  </Text>
                  <Text className="text-base text-gray-900">
                    {currentEvent.description}
                  </Text>
                </View>
              )}

              {/* Dirección */}
              {currentEvent.address && (
                <View>
                  <Text className="text-sm font-medium text-gray-500 mb-1">
                    Dirección
                  </Text>
                  <View className="flex-row items-start">
                    <Ionicons name="location-outline" size={20} color="#6b7280" className="mr-2 mt-0.5" />
                    <Text className="text-base text-gray-900 flex-1">
                      {currentEvent.address}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Fechas y horarios */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Fechas y Horarios
            </Text>

            <View className="space-y-4">
              {/* Fecha de inicio */}
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">
                  Fecha y Hora de Inicio
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  <Text className="text-base text-gray-900 ml-2">
                    {formatDate(currentEvent.start_time)}
                  </Text>
                </View>
              </View>

              {/* Fecha de fin */}
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">
                  Fecha y Hora de Fin
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                  <Text className="text-base text-gray-900 ml-2">
                    {formatDate(currentEvent.end_time)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ubicación y radio */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Ubicación
            </Text>

            <View className="space-y-4">
              {/* Coordenadas */}
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">
                  Coordenadas
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="navigate-outline" size={20} color="#6b7280" />
                  <Text className="text-base text-gray-900 ml-2">
                    {currentEvent.latitude}, {currentEvent.longitude}
                  </Text>
                </View>
              </View>

              {/* Radio permitido */}
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">
                  Radio Permitido
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="radio-outline" size={20} color="#6b7280" />
                  <Text className="text-base text-gray-900 ml-2">
                    {currentEvent.allowed_radius} metros
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Código QR */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Código QR del Evento
            </Text>

            <View className="items-center space-y-4">
              {/* Imagen del QR */}
              <View className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                {qrImageUrl ? (
                  <Image
                    source={{ uri: qrImageUrl }}
                    className="w-48 h-48"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-48 h-48 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-500 mt-2">
                      Generando QR...
                    </Text>
                  </View>
                )}
              </View>

              {/* Código QR en texto */}
              <View className="w-full">
                <Text className="text-sm font-medium text-gray-500 mb-1 text-center">
                  Código QR
                </Text>
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-sm font-mono text-gray-900 text-center">
                    {currentEvent.qr_code}
                  </Text>
                </View>
              </View>

              {/* Instrucciones */}
              <View className="bg-blue-50 p-3 rounded-lg w-full">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
                  <Text className="text-sm text-blue-800 ml-2 flex-1">
                    Los usuarios pueden escanear este código QR para registrar su asistencia al evento.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Información adicional */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Información Adicional
            </Text>

            <View className="space-y-4">
              {/* Usuario creador */}
              {currentEvent.user && (
                <View>
                  <Text className="text-sm font-medium text-gray-500 mb-1">
                    Creado por
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={20} color="#6b7280" />
                    <Text className="text-base text-gray-900 ml-2">
                      {currentEvent.user.name} ({currentEvent.user.email})
                    </Text>
                  </View>
                </View>
              )}

              {/* Fecha de creación */}
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">
                  Fecha de Creación
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                  <Text className="text-base text-gray-900 ml-2">
                    {formatDate(currentEvent.created_at)}
                  </Text>
                </View>
              </View>

              {/* Estado activo */}
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-1">
                  Estado
                </Text>
                <View className="flex-row items-center">
                  <Ionicons
                    name={currentEvent.active ? "checkmark-circle-outline" : "close-circle-outline"}
                    size={20}
                    color={currentEvent.active ? "#10b981" : "#ef4444"}
                  />
                  <Text className="text-base text-gray-900 ml-2">
                    {currentEvent.active ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Espaciado inferior */}
          <View className="h-6" />
        </View>
      </ScrollView>

      {/* Modal de impresión */}
      <PrintModal
        visible={showPrintModal}
        event={currentEvent}
        onClose={() => setShowPrintModal(false)}
      />
    </View>
  );
};

export default EventDetailsScreen;
