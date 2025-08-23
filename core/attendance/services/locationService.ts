/* Servicio para manejo de geolocalización */

import { appLogger as logger } from '@/helpers/logger/appLogger';
import * as ExpoLocation from 'expo-location';
import { Alert } from 'react-native';
import { AttendanceError, LocationConfig, UserLocation } from '../interface/attendance';

/**
 * Configuraciones predefinidas para diferentes niveles de precisión
 */
export const LOCATION_CONFIGS: Record<string, LocationConfig> = {
  high: {
    accuracy: 'high',
    timeout: 15000, // 15 segundos
    maximumAge: 10000, // 10 segundos
  },
  balanced: {
    accuracy: 'balanced',
    timeout: 10000, // 10 segundos
    maximumAge: 30000, // 30 segundos
  },
  low: {
    accuracy: 'low',
    timeout: 5000, // 5 segundos
    maximumAge: 60000, // 1 minuto
  }
};

/**
 * Servicio principal para manejo de geolocalización
 */
export class LocationService {
  
  /**
   * Solicita permisos de ubicación al usuario
   */
  static async requestLocationPermissions(): Promise<{ granted: boolean; error?: AttendanceError }> {
    try {
      logger.log('📍 Solicitando permisos de ubicación...');

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        logger.log('✅ Permisos de ubicación concedidos');
        return { granted: true };
      } else {
        logger.log('❌ Permisos de ubicación denegados:', status);
        return {
          granted: false,
          error: {
            type: 'permission',
            message: 'Se requieren permisos de ubicación para registrar asistencia',
            details: { status }
          }
        };
      }
    } catch (error) {
      logger.error('❌ Error al solicitar permisos de ubicación:', error);
      return {
        granted: false,
        error: {
          type: 'permission',
          message: 'Error al solicitar permisos de ubicación',
          details: error
        }
      };
    }
  }

  /**
   * Verifica si ya tenemos permisos de ubicación
   */
  static async checkLocationPermissions(): Promise<boolean> {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      logger.error('❌ Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Obtiene la ubicación actual del usuario
   */
  static async getCurrentLocation(config: LocationConfig = LOCATION_CONFIGS.high): Promise<{ location?: UserLocation; error?: AttendanceError }> {
    try {
      logger.log('📍 Obteniendo ubicación actual con configuración:', config);

      // Verificar permisos primero
      const hasPermissions = await this.checkLocationPermissions();
      if (!hasPermissions) {
        const permissionResult = await this.requestLocationPermissions();
        if (!permissionResult.granted) {
          return { error: permissionResult.error };
        }
      }

      // Configurar opciones de ubicación basadas en el config
      const locationOptions: ExpoLocation.LocationOptions = {
        accuracy: this.mapAccuracyToExpo(config.accuracy),
        timeInterval: 1000,
        distanceInterval: 1,
      };

      logger.log('🎯 Opciones de ubicación:', locationOptions);

      // Obtener ubicación con timeout
      const locationPromise = ExpoLocation.getCurrentPositionAsync(locationOptions);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), config.timeout);
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);

      const userLocation: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      logger.log('✅ Ubicación obtenida exitosamente:', {
        lat: userLocation.latitude.toFixed(6),
        lng: userLocation.longitude.toFixed(6),
        accuracy: userLocation.accuracy
      });

      return { location: userLocation };

    } catch (error: any) {
      logger.error('❌ Error al obtener ubicación:', error);

      let errorMessage = 'No se pudo obtener la ubicación';
      let errorType: AttendanceError['type'] = 'location';

      if (error.message === 'Timeout') {
        errorMessage = 'Tiempo de espera agotado al obtener ubicación';
      } else if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage = 'Los servicios de ubicación están deshabilitados';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage = 'Ubicación no disponible en este momento';
      }

      return {
        error: {
          type: errorType,
          message: errorMessage,
          details: error
        }
      };
    }
  }

  /**
   * Mapea la configuración de precisión a los valores de Expo Location
   */
  private static mapAccuracyToExpo(accuracy: LocationConfig['accuracy']): ExpoLocation.Accuracy {
    switch (accuracy) {
      case 'highest':
        return ExpoLocation.Accuracy.Highest;
      case 'high':
        return ExpoLocation.Accuracy.High;
      case 'balanced':
        return ExpoLocation.Accuracy.Balanced;
      case 'low':
        return ExpoLocation.Accuracy.Low;
      default:
        return ExpoLocation.Accuracy.High;
    }
  }

  /**
   * Muestra un diálogo para solicitar permisos con opciones
   */
  static showLocationPermissionDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Permisos de Ubicación Requeridos',
        'Para registrar tu asistencia necesitamos acceso a tu ubicación. Esto nos permite verificar que estés en el lugar correcto del evento.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Permitir',
            onPress: async () => {
              const result = await this.requestLocationPermissions();
              resolve(result.granted);
            }
          }
        ]
      );
    });
  }

  /**
   * Calcula la distancia entre dos puntos geográficos (en metros)
   * Usando la fórmula de Haversine
   */
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en metros
  }
}
