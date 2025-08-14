import { useUserAttendanceStore } from '@/presentation/user-attendance/store/useUserAttendanceStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const AttendancesHomeScreen = () => {
  // Store de asistencias del usuario
  const {
    attendances,
    filteredAttendances,
    loadingStatus,
    error,
    stats,
    currentFilters,
    searchTerm,
    fetchMyAttendances,
    fetchMyAttendanceStats,
    setFilters,
    setSearchTerm,
    clearFilters,
    refreshData
  } = useUserAttendanceStore();

  // Estados locales
  const [showFilters, setShowFilters] = useState(false);

  const isLoading = loadingStatus === 'loading';
  const isError = loadingStatus === 'error';

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('📋 Cargando datos de asistencias...');
    await fetchMyAttendances();
    await fetchMyAttendanceStats();
  };

  // Función para refrescar
  const onRefresh = () => {
    refreshData();
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

  // Función para formatear distancia
  const formatDistance = (distance: string) => {
    const dist = parseFloat(distance);
    return dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`;
  };

  // Función para navegar al QR Scanner
  const navigateToQRScanner = () => {
    router.push('/(attendances-app)/qrAttendance');
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
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Mis Asistencias
              </Text>
              <Text className="text-gray-600">
                Historial de eventos
              </Text>
            </View>

            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
              onPress={navigateToQRScanner}
            >
              <Ionicons name="qr-code" size={20} color="white" />
              <Text className="text-white font-medium ml-1">
                Escanear
              </Text>
            </TouchableOpacity>
          </View>

          {/* Estadísticas rápidas */}
          {stats && (
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">
                  {stats.total_attendances}
                </Text>
                <Text className="text-gray-600 text-sm">Total</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {stats.verified_attendances}
                </Text>
                <Text className="text-gray-600 text-sm">Verificadas</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {stats.events_attended}
                </Text>
                <Text className="text-gray-600 text-sm">Eventos</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-orange-600">
                  {stats.average_distance.toFixed(1)}m
                </Text>
                <Text className="text-gray-600 text-sm">Distancia</Text>
              </View>
            </View>
          )}
        </View>

        {/* Barra de búsqueda y filtros */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center space-x-3">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Ionicons name="search" size={20} color="#6b7280" />
              <TextInput
                className="flex-1 ml-2 text-gray-900"
                placeholder="Buscar por evento..."
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              className="bg-gray-100 p-2 rounded-lg"
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="filter" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Filtros expandibles */}
          {showFilters && (
            <View className="mt-3 flex-row space-x-2">
              <TouchableOpacity
                className={`px-3 py-2 rounded-lg ${
                  currentFilters.verified === true
                    ? 'bg-green-100 border border-green-300'
                    : 'bg-gray-100 border border-gray-300'
                }`}
                onPress={() => setFilters({
                  ...currentFilters,
                  verified: currentFilters.verified === true ? undefined : true
                })}
              >
                <Text className={`text-sm font-medium ${
                  currentFilters.verified === true ? 'text-green-800' : 'text-gray-700'
                }`}>
                  Verificadas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-300"
                onPress={clearFilters}
              >
                <Text className="text-sm font-medium text-gray-700">
                  Limpiar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Contenido principal */}
        <View className="px-4 py-4">
          {isLoading && attendances.length === 0 ? (
            // Estado de carga inicial
            <View className="bg-white rounded-lg p-8 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-4">
                Cargando asistencias...
              </Text>
            </View>
          ) : isError ? (
            // Estado de error
            <View className="bg-white rounded-lg p-8 items-center">
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                Error al cargar asistencias
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                {error || 'No se pudieron cargar tus asistencias'}
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
          ) : filteredAttendances.length === 0 ? (
            // Estado vacío
            <View className="bg-white rounded-lg p-8 items-center">
              <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-medium text-gray-500 mt-4 mb-2">
                {searchTerm || Object.keys(currentFilters).length > 0
                  ? 'No se encontraron asistencias'
                  : 'No tienes asistencias registradas'
                }
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                {searchTerm || Object.keys(currentFilters).length > 0
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Escanea un código QR para registrar tu primera asistencia'
                }
              </Text>

              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={navigateToQRScanner}
              >
                <Text className="text-white font-medium">
                  Escanear QR
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Lista de asistencias
            <View className="space-y-3">
              {filteredAttendances.map((attendance) => (
                <View
                  key={attendance.id}
                  className="bg-white rounded-lg p-4 border border-gray-200"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="text-lg font-semibold text-gray-900 mb-1">
                        {attendance.event.name}
                      </Text>
                      {attendance.event.description && (
                        <Text
                          className="text-gray-600 text-sm"
                          numberOfLines={2}
                        >
                          {attendance.event.description}
                        </Text>
                      )}
                    </View>

                    <View className={`px-2 py-1 rounded-full ${
                      attendance.verified
                        ? 'bg-green-100'
                        : 'bg-yellow-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        attendance.verified
                          ? 'text-green-800'
                          : 'text-yellow-800'
                      }`}>
                        {attendance.verified ? 'VERIFICADA' : 'PENDIENTE'}
                      </Text>
                    </View>
                  </View>

                  {/* Información de la asistencia */}
                  <View className="space-y-2">
                    {/* Fecha de registro */}
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-2">
                        Registrado: {formatDate(attendance.checked_in_at)}
                      </Text>
                    </View>

                    {/* Distancia */}
                    <View className="flex-row items-center">
                      <Ionicons name="location-outline" size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-2">
                        Distancia: {formatDistance(attendance.distance_meters)}
                      </Text>
                    </View>

                    {/* Dirección del evento */}
                    {attendance.event.address && (
                      <View className="flex-row items-center">
                        <Ionicons name="map-outline" size={16} color="#6b7280" />
                        <Text
                          className="text-sm text-gray-600 ml-2 flex-1"
                          numberOfLines={1}
                        >
                          {attendance.event.address}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AttendancesHomeScreen;