import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const CreateEventScreen = () => {
  // Referencias para el ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  // Estados locales para el formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [allowedRadius, setAllowedRadius] = useState('50');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Estados para los modales de fecha/hora
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  // Estados para errores de validación
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    address: '',
    allowedRadius: '',
    startTime: '',
    endTime: ''
  });

  // Estados para coordenadas (se obtendrán automáticamente)
  const [coordinates, setCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null
  });

  const { height } = useWindowDimensions();

  // Funciones de validación
  const validateName = (name: string) => {
    if (!name.trim()) return 'El nombre del evento es requerido';
    if (name.length > 255) return 'El nombre no puede exceder 255 caracteres';
    return '';
  };

  const validateDescription = (description: string) => {
    // Descripción es opcional, solo validamos longitud si existe
    return '';
  };

  const validateAddress = (address: string) => {
    if (address.length > 500) return 'La dirección no puede exceder 500 caracteres';
    return '';
  };

  const validateAllowedRadius = (radius: string) => {
    const numRadius = parseInt(radius);
    if (!radius.trim()) return 'El radio permitido es requerido';
    if (isNaN(numRadius)) return 'El radio debe ser un número válido';
    if (numRadius < 10) return 'El radio mínimo es 10 metros';
    if (numRadius > 500) return 'El radio máximo es 500 metros';
    return '';
  };

  const validateStartTime = (startTime: Date | null) => {
    if (!startTime) return 'La fecha y hora de inicio es requerida';
    if (startTime < new Date()) return 'La fecha de inicio debe ser futura';
    return '';
  };

  const validateEndTime = (endTime: Date | null, startTime: Date | null) => {
    if (!endTime) return 'La fecha y hora de fin es requerida';
    if (!startTime) return 'Debe seleccionar primero la fecha de inicio';
    if (endTime <= startTime) return 'La fecha de fin debe ser posterior al inicio';
    return '';
  };

  // Validar campo individual
  const validateField = (field: string, value: string | Date | null) => {
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value as string);
        break;
      case 'description':
        error = validateDescription(value as string);
        break;
      case 'address':
        error = validateAddress(value as string);
        break;
      case 'allowedRadius':
        error = validateAllowedRadius(value as string);
        break;
      case 'startTime':
        error = validateStartTime(value as Date | null);
        break;
      case 'endTime':
        error = validateEndTime(value as Date | null, startTime);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  // Validar todo el formulario
  const validateForm = () => {
    const nameValid = validateField('name', name);
    const descriptionValid = validateField('description', description);
    const addressValid = validateField('address', address);
    const radiusValid = validateField('allowedRadius', allowedRadius);
    const startTimeValid = validateField('startTime', startTime);
    const endTimeValid = validateField('endTime', endTime);

    return nameValid && descriptionValid && addressValid &&
           radiusValid && startTimeValid && endTimeValid &&
           coordinates.latitude !== null && coordinates.longitude !== null;
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      // TODO: Implementar geolocalización
      console.log('🌍 Obteniendo ubicación actual...');

      // Simulación temporal - reemplazar con geolocalización real
      setTimeout(() => {
        setCoordinates({
          latitude: 19.4326, // Ciudad de México ejemplo
          longitude: -99.1332
        });
        setIsGettingLocation(false);
        Alert.alert('Ubicación obtenida', 'Se ha obtenido la ubicación actual correctamente');
      }, 2000);

    } catch (error) {
      console.error('❌ Error al obtener ubicación:', error);
      setIsGettingLocation(false);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    }
  };

  // Función para manejar la creación del evento
  const handleCreateEvent = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    if (!coordinates.latitude || !coordinates.longitude) {
      Alert.alert('Error', 'Debe obtener la ubicación antes de crear el evento');
      return;
    }

    setIsLoading(true);
    try {
      // Formatear fechas para la API (formato ISO)
      const formatDateForAPI = (date: Date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };

      const eventData = {
        name: name.trim(),
        description: description.trim() || null,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address: address.trim() || null,
        allowed_radius: parseInt(allowedRadius),
        start_time: formatDateForAPI(startTime!),
        end_time: formatDateForAPI(endTime!)
      };

      console.log('📝 Creando evento con datos:', eventData);

      // TODO: Implementar llamada a la API
      // const response = await eventsApi.post('/events', eventData);

      // Simulación temporal
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Evento Creado',
          'El evento ha sido creado exitosamente.',
          [
            {
              text: 'Ver Eventos',
              onPress: () => router.replace('/(admin-app)/events')
            }
          ]
        );
      }, 2000);

    } catch (error) {
      console.error('❌ Error al crear evento:', error);
      setIsLoading(false);
      Alert.alert('Error', 'No se pudo crear el evento. Intente nuevamente.');
    }
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    return name.trim() &&
           allowedRadius.trim() &&
           startTime !== null &&
           endTime !== null &&
           coordinates.latitude !== null &&
           coordinates.longitude !== null &&
           Object.values(errors).every(error => error === '');
  };

  // Funciones para manejar los selectores de fecha
  const showStartDatePicker = () => {
    setStartDatePickerVisibility(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false);
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartTime(date);
    validateField('startTime', date);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisibility(false);
  };

  const handleEndDateConfirm = (date: Date) => {
    setEndTime(date);
    validateField('endTime', date);
    hideEndDatePicker();
  };

  // Función para formatear fecha y hora
  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled={true}
      >
        {/* Espacio superior - 25% de la pantalla */}
        <View style={{ height: height * 0.25 }} className="justify-end pb-6">
          {/* Textos de bienvenida */}
          <View className="px-6">
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              Crear Evento
            </Text>
            <Text className="text-2xl font-bold text-blue-600 mb-4">
              Nuevo Evento
            </Text>
            <Text className="text-gray-500 text-base">
              Complete la información para crear un nuevo evento de asistencia
            </Text>
          </View>
        </View>

        {/* Formulario - 75% restante */}
        <View className="flex-1 px-6 pt-6">
          {/* Campo Nombre del Evento */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Nombre del Evento *
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Ej: Reunión de equipo, Conferencia..."
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) validateField('name', text);
              }}
              onBlur={() => validateField('name', name)}
              autoCapitalize="words"
              editable={!isLoading}
              maxLength={255}
            />
            {errors.name ? (
              <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
            ) : null}
          </View>

          {/* Campo Descripción */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Descripción (Opcional)
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.description ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Descripción del evento..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) validateField('description', text);
              }}
              onBlur={() => validateField('description', description)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
            {errors.description ? (
              <Text className="text-red-500 text-xs mt-1">{errors.description}</Text>
            ) : null}
          </View>

          {/* Campo Dirección */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Dirección (Opcional)
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.address ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Dirección del evento..."
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address) validateField('address', text);
              }}
              onBlur={() => validateField('address', address)}
              autoCapitalize="words"
              editable={!isLoading}
              maxLength={500}
            />
            {errors.address ? (
              <Text className="text-red-500 text-xs mt-1">{errors.address}</Text>
            ) : null}
          </View>

          {/* Campo Radio Permitido */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Radio Permitido (metros) *
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.allowedRadius ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="50"
              placeholderTextColor="#9CA3AF"
              value={allowedRadius}
              onChangeText={(text) => {
                setAllowedRadius(text);
                if (errors.allowedRadius) validateField('allowedRadius', text);
              }}
              onBlur={() => validateField('allowedRadius', allowedRadius)}
              keyboardType="numeric"
              editable={!isLoading}
            />
            <Text className="text-gray-400 text-xs mt-1">
              Rango: 10-500 metros
            </Text>
            {errors.allowedRadius ? (
              <Text className="text-red-500 text-xs mt-1">{errors.allowedRadius}</Text>
            ) : null}
          </View>

          {/* Sección de Ubicación */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Ubicación del Evento *
            </Text>
            <TouchableOpacity
              className={`px-4 py-4 border rounded-lg flex-row items-center justify-between ${
                coordinates.latitude ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onPress={getCurrentLocation}
              disabled={isGettingLocation || isLoading}
            >
              <View className="flex-1">
                {coordinates.latitude ? (
                  <View>
                    <Text className="text-green-700 font-medium">
                      ✓ Ubicación obtenida
                    </Text>
                    <Text className="text-green-600 text-xs">
                      Lat: {coordinates.latitude.toFixed(6)}, Lng: {coordinates.longitude?.toFixed(6)}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-500">
                    {isGettingLocation ? 'Obteniendo ubicación...' : 'Toque para obtener ubicación actual'}
                  </Text>
                )}
              </View>
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Ionicons
                  name="location"
                  size={24}
                  color={coordinates.latitude ? "#10B981" : "#6B7280"}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Campo Fecha y Hora de Inicio */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Fecha y Hora de Inicio *
            </Text>
            <TouchableOpacity
              className={`px-4 py-4 border rounded-lg flex-row items-center justify-between ${
                errors.startTime ? 'border-red-500' : 'border-gray-200'
              }`}
              onPress={showStartDatePicker}
              disabled={isLoading}
            >
              <Text className={`text-base ${
                startTime ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {startTime ? formatDateTime(startTime) : 'Seleccionar fecha y hora'}
              </Text>
              <Ionicons
                name="calendar"
                size={20}
                color={startTime ? "#374151" : "#9CA3AF"}
              />
            </TouchableOpacity>
            <Text className="text-gray-400 text-xs mt-1">
              Toque para seleccionar fecha y hora de inicio
            </Text>
            {errors.startTime ? (
              <Text className="text-red-500 text-xs mt-1">{errors.startTime}</Text>
            ) : null}
          </View>

          {/* Campo Fecha y Hora de Fin */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Fecha y Hora de Fin *
            </Text>
            <TouchableOpacity
              className={`px-4 py-4 border rounded-lg flex-row items-center justify-between ${
                errors.endTime ? 'border-red-500' : 'border-gray-200'
              }`}
              onPress={showEndDatePicker}
              disabled={isLoading}
            >
              <Text className={`text-base ${
                endTime ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {endTime ? formatDateTime(endTime) : 'Seleccionar fecha y hora'}
              </Text>
              <Ionicons
                name="calendar"
                size={20}
                color={endTime ? "#374151" : "#9CA3AF"}
              />
            </TouchableOpacity>
            <Text className="text-gray-400 text-xs mt-1">
              Debe ser posterior a la fecha de inicio
            </Text>
            {errors.endTime ? (
              <Text className="text-red-500 text-xs mt-1">{errors.endTime}</Text>
            ) : null}
          </View>

          {/* Botón de Crear Evento */}
          <TouchableOpacity
            className={`py-4 rounded-lg mb-4 ${
              isLoading || !isFormValid()
                ? 'bg-gray-300'
                : 'bg-blue-600'
            }`}
            onPress={handleCreateEvent}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Crear Evento
              </Text>
            )}
          </TouchableOpacity>

          {/* Botón Cancelar */}
          <TouchableOpacity
            className="py-4 rounded-lg mb-4 border border-gray-300"
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text className="text-gray-600 text-center text-lg font-semibold">
              Cancelar
            </Text>
          </TouchableOpacity>

          {/* Información adicional */}
          <View className="items-center mt-4">
            <Text className="text-gray-400 text-xs text-center">
              Los campos marcados con * son obligatorios
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              La ubicación se obtendrá automáticamente desde su dispositivo
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal para seleccionar fecha de inicio */}
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="datetime"
        onConfirm={handleStartDateConfirm}
        onCancel={hideStartDatePicker}
        minimumDate={new Date()}
        locale="es_ES"
        headerTextIOS="Seleccionar fecha y hora de inicio"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />

      {/* Modal para seleccionar fecha de fin */}
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="datetime"
        onConfirm={handleEndDateConfirm}
        onCancel={hideEndDatePicker}
        minimumDate={startTime || new Date()}
        locale="es_ES"
        headerTextIOS="Seleccionar fecha y hora de fin"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />
    </KeyboardAvoidingView>
  );
};

export default CreateEventScreen;