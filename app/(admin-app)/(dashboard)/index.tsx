import { useEventStore } from '@/presentation/event/store/useEventStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const AdminDashboardScreen = () => {
  // Store de eventos
  const {
    events,
    loadingStatus,
    error,
    fetchUpcomingEvents
  } = useEventStore();

  const isLoading = loadingStatus === 'loading';
  const isError = loadingStatus === 'error';

  // Cargar próximos eventos al montar el componente
  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    console.log('📋 Cargando próximos eventos para dashboard...');
    await fetchUpcomingEvents(5); // Límite de 5 eventos para el dashboard
  };

  // Función para refrescar
  const onRefresh = () => {
    loadUpcomingEvents();
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para navegar a detalles del evento
  const navigateToEventDetails = (eventId: number) => {
    router.push(`/(admin-app)/events/${eventId}` as any);
  };

  // Función para navegar a todos los eventos
  const navigateToAllEvents = () => {
    router.push('/(admin-app)/events');
  };

  // Función para navegar a crear evento
  const navigateToCreateEvent = () => {
    router.push('/(admin-app)/events/create');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
          />
        }
      >
        {/* Header del Dashboard */}
        {/* <View className="bg-white border-b border-gray-200 px-4 py-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </Text>
          <Text className="text-gray-600">
            Gestiona tus eventos y revisa las próximas actividades
          </Text>
        </View> */}

        {/* Sección de Próximos Eventos */}
        <View className="px-4 py-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Próximos Eventos
              </Text>
            </View>

            {events.length > 0 && (
              <TouchableOpacity
                onPress={navigateToAllEvents}
                className="flex-row items-center"
              >
                <Text className="text-blue-600 font-medium mr-1">
                  Ver todos
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
              </TouchableOpacity>
            )}
          </View>

          {/* Contenido de eventos */}
          {isLoading && events.length === 0 ? (
            // Estado de carga inicial
            <View className="bg-white rounded-lg p-8 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-4">
                Cargando próximos eventos...
              </Text>
            </View>
          ) : isError ? (
            // Estado de error
            <View className="bg-white rounded-lg p-8 items-center">
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                Error al cargar eventos
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                {error || 'No se pudieron cargar los próximos eventos'}
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-4 py-2 rounded-lg"
                onPress={onRefresh}
              >
                <Text className="text-white font-medium">
                  Reintentar
                </Text>
              </TouchableOpacity>
            </View>
          ) : events.length === 0 ? (
            // Estado vacío - Aquí irán los tips que me proporcionarás
            <View className="bg-white rounded-lg p-8 items-center">
              <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-medium text-gray-500 mt-4 mb-2">
                No hay próximos eventos
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                No tienes eventos programados para el futuro
              </Text>

              {/* Consejos para cuando no hay eventos */}
              {/* <View className="w-full mb-6">
                <EventTips />
              </View> */}

              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={navigateToCreateEvent}
              >
                <Text className="text-white font-medium">
                  Crear Primer Evento
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Lista de próximos eventos
            <View className="space-y-3">
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                  onPress={() => navigateToEventDetails(event.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="text-lg font-semibold text-gray-900 mb-1">
                        {event.name}
                      </Text>
                      {event.description && (
                        <Text
                          className="text-gray-600 text-sm"
                          numberOfLines={2}
                        >
                          {event.description}
                        </Text>
                      )}
                    </View>

                    <View className="bg-blue-100 px-2 py-1 rounded-full">
                      <Text className="text-blue-800 text-xs font-medium">
                        PRÓXIMO
                      </Text>
                    </View>
                  </View>

                  {/* Información del evento */}
                  <View className="space-y-2">
                    {/* Asistentes */}
                    <View className="flex-row items-center">
                      <Ionicons name="people-outline" size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-2">
                        Asistentes: {event.attendees_count}
                      </Text>
                    </View>

                    {/* Fecha de inicio */}
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-2">
                        Inicio: {formatDate(event.start_time)}
                      </Text>
                    </View>

                    {/* Ubicación */}
                    {event.address && (
                      <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text
                          className="text-sm text-gray-600 ml-2 flex-1"
                          numberOfLines={1}
                        >
                          {event.address}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Indicador de navegación */}
                  <View className="flex-row justify-end mt-3">
                    <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Botón para ver todos los eventos */}
              <TouchableOpacity
                className="bg-gray-100 rounded-lg p-4 items-center border border-gray-200"
                onPress={navigateToAllEvents}
              >
                <Text className="text-gray-700 font-medium">
                  Ver todos los eventos
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminDashboardScreen;