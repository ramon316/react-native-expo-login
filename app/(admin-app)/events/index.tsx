import { useEventStore } from '@/presentation/event/store/useEventStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const EventsIndexScreen = () => {
  // Store de eventos
  const {
    events,
    loadingStatus,
    error,
    fetchEvents,
    removeEvent
  } = useEventStore();

  const isLoading = loadingStatus === 'loading';
  const isError = loadingStatus === 'error';

  // Cargar eventos al montar el componente
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    console.log('📋 Cargando eventos...');
    await fetchEvents();
  };

  // Función para refrescar la lista
  const onRefresh = () => {
    loadEvents();
  };

  // Función para navegar a crear evento
 /*  const navigateToCreate = () => {
    router.push('/(admin-app)/events/create');
  }; */

  // Función para navegar a detalles del evento
  /* const navigateToDetails = (eventId: number) => {
    router.push(`/(admin-app)/events/${eventId}` as any);
  }; */

  // Función para eliminar evento
  const handleDeleteEvent = (eventId: number, eventName: string) => {
    Alert.alert(
      'Eliminar Evento',
      `¿Estás seguro de que deseas eliminar el evento "${eventName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDeleteEvent(eventId)
        }
      ]
    );
  };

  const confirmDeleteEvent = async (eventId: number) => {
    const success = await removeEvent(eventId);
    if (success) {
      Alert.alert('Éxito', 'Evento eliminado correctamente');
    } else {
      Alert.alert('Error', 'No se pudo eliminar el evento');
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para obtener el estado del evento
  const getEventStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { status: 'upcoming', label: 'Próximo', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
      return { status: 'active', label: 'Activo', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'finished', label: 'Finalizado', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Renderizar cada evento
  const renderEventItem = ({ item: event }: { item: any }) => {
    const eventStatus = getEventStatus(event.start_time, event.end_time);

    return (
      <TouchableOpacity
        className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
        onPress={() => router.push('/(admin-app)/events/create')}
        activeOpacity={0.7}
      >
        {/* Header del evento */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {event.name}
            </Text>
            <View className={`self-start px-2 py-1 rounded-full ${eventStatus.color}`}>
              <Text className="text-xs font-medium">
                {eventStatus.label}
              </Text>
            </View>
          </View>

          {/* Botón de opciones */}
          <TouchableOpacity
            className="p-2"
            onPress={() => handleDeleteEvent(event.id, event.name)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Descripción */}
        {event.description && (
          <Text className="text-gray-600 mb-3" numberOfLines={2}>
            {event.description}
          </Text>
        )}

        {/* Información del evento */}
        <View className="space-y-2">
          {/* Asistentes */}
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              Asistentes: {event.attendees_count}
            </Text>
          </View>

          {/* Fechas */}
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              Inicio: {formatDate(event.start_time)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              Fin: {formatDate(event.end_time)}
            </Text>
          </View>

          {/* Ubicación */}
          {event.address && (
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2" numberOfLines={1}>
                {event.address}
              </Text>
            </View>
          )}

          {/* Radio permitido */}
          <View className="flex-row items-center">
            <Ionicons name="radio-outline" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              Radio: {event.allowed_radius}m
            </Text>
          </View>

          {/* QR Code */}
          <View className="flex-row items-center">
            <Ionicons name="qr-code-outline" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2 font-mono">
              {event.qr_code}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar estado vacío
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-12">
      <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
      <Text className="text-lg font-medium text-gray-500 mt-4 mb-2">
        No hay eventos creados
      </Text>
      <Text className="text-gray-400 text-center mb-6 px-8">
        Crea tu primer evento para comenzar a gestionar la asistencia
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-lg"
        onPress={() => router.push('/(admin-app)/events/create')}
      >
        <Text className="text-white font-medium">
          Crear Primer Evento
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar estado de error
  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center py-12">
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
      <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
        Error al cargar eventos
      </Text>
      <Text className="text-gray-600 text-center mb-6 px-8">
        {error || 'Ocurrió un error inesperado'}
      </Text>
      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-lg"
        onPress={loadEvents}
      >
        <Text className="text-white font-medium">
          Reintentar
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Eventos
            </Text>
            <Text className="text-gray-600">
              {events.length} evento{events.length !== 1 ? 's' : ''} creado{events.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            onPress={() => router.push('/(admin-app)/events/create')}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-1">
              Nuevo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      <View className="flex-1 px-4 py-4">
        {isLoading && events.length === 0 ? (
          // Estado de carga inicial
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4">
              Cargando eventos...
            </Text>
          </View>
        ) : isError ? (
          // Estado de error
          renderErrorState()
        ) : events.length === 0 ? (
          // Estado vacío
          renderEmptyState()
        ) : (
          // Lista de eventos
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={onRefresh}
                colors={['#3b82f6']}
                tintColor="#3b82f6"
              />
            }
            contentContainerStyle={{
              paddingBottom: 20
            }}
          />
        )}
      </View>
    </View>
  );
};

export default EventsIndexScreen;