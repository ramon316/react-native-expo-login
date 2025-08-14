/* Pantalla independiente de Consejos para el Drawer */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const EventTipsScreen = () => {
  // Array de consejos completos
  const consejos = [
    {
      icon: 'bulb-outline' as const,
      title: 'Ubicación Física',
      description: 'Cuando crees un nuevo evento, recuerda que es necesario estar físicamente en el lugar del mismo.',
      details: 'Para registrar asistencia, tanto el administrador como los asistentes deben estar en la ubicación exacta del evento. El sistema utiliza GPS para verificar la proximidad.'
    },
    {
      icon: 'calendar-outline' as const,
      title: 'Disponibilidad de Eventos',
      description: 'Los eventos estarán disponibles para inscripción durante la fecha de inicio y fin del evento.',
      details: 'Los usuarios solo podrán registrar su asistencia cuando el evento esté activo (entre la fecha de inicio y fin). Asegúrate de configurar correctamente estas fechas.'
    },
    {
      icon: 'people-outline' as const,
      title: 'Gestión de Asistentes',
      description: 'En eventos, podrás visualizar los eventos activos, así como los asistentes inscritos.',
      details: 'El dashboard te mostrará estadísticas en tiempo real de asistencia, incluyendo el número de personas registradas y la distancia desde la ubicación del evento.'
    },
    {
      icon: 'qr-code-outline' as const,
      title: 'Códigos QR',
      description: 'Cada evento genera automáticamente un código QR único para el registro de asistencia.',
      details: 'Los asistentes escanearán este código QR para registrar su presencia. El código es único por evento y no puede ser reutilizado.'
    },
    {
      icon: 'location-outline' as const,
      title: 'Radio de Proximidad',
      description: 'Define un radio de proximidad para determinar qué tan cerca deben estar los asistentes.',
      details: 'Puedes configurar un radio en metros. Los asistentes deben estar dentro de este radio para poder registrar su asistencia exitosamente.'
    },
    {
      icon: 'time-outline' as const,
      title: 'Horarios de Eventos',
      description: 'Los eventos tienen horarios específicos de inicio y fin que determinan su disponibilidad.',
      details: 'Solo durante el período activo del evento (entre fecha de inicio y fin) los asistentes podrán registrar su asistencia.'
    }
  ];

  const navigateToCreateEvent = () => {
    router.push('/(admin-app)/events/create');
  };

  const navigateToEvents = () => {
    router.push('/(admin-app)/events');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="bulb" size={28} color="#3b82f6" />
            <Text className="text-3xl font-bold text-gray-900 ml-3">
              Consejos
            </Text>
          </View>
          <Text className="text-gray-600">
            Guías y recomendaciones para gestionar tus eventos de manera efectiva
          </Text>
        </View>

        {/* Lista de Consejos */}
        <View className="px-4 py-6 space-y-4">
          {consejos.map((consejo, index) => (
            <View 
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Header del consejo */}
              <View className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-full mr-3">
                    <Ionicons name={consejo.icon} size={20} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-blue-900 text-lg">
                      {consejo.title}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Contenido del consejo */}
              <View className="p-4">
                <Text className="text-gray-700 text-base leading-6 mb-3">
                  {consejo.description}
                </Text>
                
                <View className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <Text className="text-gray-600 text-sm leading-5">
                    💡 <Text className="font-medium">Detalle:</Text> {consejo.details}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Acciones Rápidas */}
        <View className="px-4 pb-6">
          <View className="bg-white rounded-lg border border-gray-200 p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              🚀 Acciones Rápidas
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity
                className="bg-blue-600 rounded-lg p-4 flex-row items-center justify-center"
                onPress={navigateToCreateEvent}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text className="text-white font-medium ml-2">
                  Crear Nuevo Evento
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-gray-100 rounded-lg p-4 flex-row items-center justify-center border border-gray-300"
                onPress={navigateToEvents}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar" size={20} color="#374151" />
                <Text className="text-gray-700 font-medium ml-2">
                  Ver Mis Eventos
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer informativo */}
        <View className="px-4 pb-8">
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text className="font-medium text-blue-900 ml-2">
                ¿Necesitas más ayuda?
              </Text>
            </View>
            <Text className="text-blue-700 text-sm leading-5">
              Estos consejos te ayudarán a aprovechar al máximo el sistema de gestión de eventos. 
              Recuerda que puedes crear eventos, gestionar asistentes y monitorear la asistencia en tiempo real.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EventTipsScreen;
