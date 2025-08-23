/* Store Zustand para manejo de asistencias */

import {
  getAttendanceHistory,
  getAttendanceStats,
  submitAttendance
} from "@/core/attendance/actions/attendanceActions";
import {
  Attendance,
  AttendanceError,
  AttendanceHistory,
  AttendanceRequest,
  AttendanceStats,
  AttendanceStatus,
  UserLocation
} from "@/core/attendance/interface/attendance";
import { LocationService } from "@/core/attendance/services/locationService";
import { create } from "zustand";

import { appLogger as logger } from '@/helpers/logger/appLogger';

/**
 * Estado del store de asistencias
 */
interface AttendanceState {
  // Estados principales
  status: AttendanceStatus;
  error: AttendanceError | null;
  
  // Datos de ubicación
  userLocation: UserLocation | null;
  locationPermissionGranted: boolean;
  
  // Datos de asistencia
  currentAttendance: Attendance | null;
  attendanceHistory: AttendanceHistory | null;
  attendanceStats: AttendanceStats | null;
  
  // Estados de carga
  isLoadingLocation: boolean;
  isSubmittingAttendance: boolean;
  isLoadingHistory: boolean;
  isLoadingStats: boolean;
  
  // Datos del QR escaneado
  scannedQRCode: string | null;
  
  // Acciones
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<boolean>;
  setScannedQRCode: (qrCode: string) => void;
  submitAttendanceRecord: (qrCode: string) => Promise<Attendance | null>;
  loadAttendanceHistory: (page?: number) => Promise<void>;
  loadAttendanceStats: () => Promise<void>;
  clearError: () => void;
  resetAttendanceFlow: () => void;
  setStatus: (status: AttendanceStatus) => void;
}

/**
 * Store principal para asistencias
 */
export const useAttendanceStore = create<AttendanceState>()((set, get) => ({
  // Estado inicial
  status: 'idle',
  error: null,
  userLocation: null,
  locationPermissionGranted: false,
  currentAttendance: null,
  attendanceHistory: null,
  attendanceStats: null,
  isLoadingLocation: false,
  isSubmittingAttendance: false,
  isLoadingHistory: false,
  isLoadingStats: false,
  scannedQRCode: null,

  /**
   * Solicita permisos de ubicación
   */
  requestLocationPermission: async () => {
    try {
      logger.log('🔐 Solicitando permisos de ubicación...');
      set({ status: 'requesting-location', error: null });

      const result = await LocationService.requestLocationPermissions();

      if (result.granted) {
        logger.log('✅ Permisos concedidos');
        set({
          locationPermissionGranted: true,
          status: 'idle',
          error: null
        });
        return true;
      } else {
        logger.log('❌ Permisos denegados');
        set({
          locationPermissionGranted: false,
          status: 'error',
          error: result.error || {
            type: 'permission',
            message: 'Permisos de ubicación denegados'
          }
        });
        return false;
      }
    } catch (error) {
      logger.error('❌ Error al solicitar permisos:', error);
      set({
        status: 'error',
        error: {
          type: 'permission',
          message: 'Error al solicitar permisos de ubicación',
          details: error
        }
      });
      return false;
    }
  },

  /**
   * Obtiene la ubicación actual del usuario
   */
  getCurrentLocation: async () => {
    try {
      logger.log('📍 Obteniendo ubicación actual...');
      set({ isLoadingLocation: true, error: null });

      const result = await LocationService.getCurrentLocation();

      if (result.location) {
        logger.log('✅ Ubicación obtenida exitosamente');
        set({
          userLocation: result.location,
          isLoadingLocation: false,
          error: null
        });
        return true;
      } else {
        logger.log('❌ Error al obtener ubicación');
        set({
          isLoadingLocation: false,
          error: result.error || {
            type: 'location',
            message: 'No se pudo obtener la ubicación'
          }
        });
        return false;
      }
    } catch (error) {
      logger.error('❌ Error inesperado al obtener ubicación:', error);
      set({
        isLoadingLocation: false,
        error: {
          type: 'location',
          message: 'Error inesperado al obtener ubicación',
          details: error
        }
      });
      return false;
    }
  },

  /**
   * Establece el código QR escaneado
   */
  setScannedQRCode: (qrCode: string) => {
    logger.log('📱 QR Code escaneado:', qrCode);
    set({
      scannedQRCode: qrCode,
      status: 'scanning',
      error: null
    });
  },

  /**
   * Envía el registro de asistencia a la API
   */
  submitAttendanceRecord: async (qrCode: string) => {
    try {
      const { userLocation } = get();
      
      if (!userLocation) {
        logger.error('❌ No hay ubicación disponible');
        set({
          error: {
            type: 'location',
            message: 'Se requiere ubicación para registrar asistencia'
          }
        });
        return null;
      }

      logger.log('📝 Enviando registro de asistencia...');
      set({
        isSubmittingAttendance: true,
        status: 'submitting',
        error: null
      });

      const attendanceData: AttendanceRequest = {
        qr_code: qrCode,
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude
      };

      const result = await submitAttendance(attendanceData);
      
      // Verificar si el resultado es válido
      if (result && result.attendance) {
        logger.log('✅ Asistencia registrada exitosamente');
        set({
          currentAttendance: result.attendance,
          isSubmittingAttendance: false,
          status: 'success',
          error: null
        });
        return result.attendance;
      } else {
        // Si result es null pero no hubo excepción, es un error inesperado
        logger.error('❌ Resultado inesperado: result es null sin excepción');
        set({
          isSubmittingAttendance: false,
          status: 'error',
          error: {
            type: 'network',
            message: 'Error inesperado en la respuesta del servidor'
          }
        });
        return null;
      }
    } catch (error: any) {
      logger.error('❌ Error capturado en store:', error);
      logger.error('📊 Status del error:', error.response?.status);
      logger.error('📄 Data del error:', error.response?.data);

      // Extraer mensaje específico del error de la API
      let errorMessage = 'Error inesperado al registrar asistencia';
      let errorType: AttendanceError['type'] = 'network';

      if (error.response?.data) {
        const apiError = error.response.data;
        logger.log('🔍 Procesando error de API:', {
          status: error.response.status,
          message: apiError.message,
          errors: apiError.errors
        });

        // Manejar errores específicos de la API según tus códigos
        if (error.response.status === 422) {
          // Error de validación
          if (apiError.message) {
            errorMessage = apiError.message;
          } else if (apiError.errors) {
            // Construir mensaje de errores de validación
            const validationErrors = Object.values(apiError.errors).flat();
            errorMessage = validationErrors.join('. ');
          }
          errorType = 'validation';
        } else if (error.response.status === 403) {
          // Evento no activo
          errorMessage = apiError.message || 'Este evento no está activo o ya ha finalizado';
          errorType = 'event_inactive';
        } else if (error.response.status === 405) {
          // Usuario ya registró asistencia
          errorMessage = apiError.message || 'Ya tienes registrada tu asistencia para este evento';
          errorType = 'already_registered';
        } else if (error.response.status === 400) {
          // Usuario demasiado lejos
          errorMessage = apiError.message || 'Te encuentras fuera del área permitida para registrar asistencia. Acércate más al lugar del evento.';
          errorType = 'out_of_range';
        } else if (error.response.status === 404) {
          errorMessage = 'El código QR no es válido o el evento no existe';
          errorType = 'invalid_qr';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
        errorType = 'network';
      } else if (error.response?.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        errorType = 'unauthorized';
      }

      const finalError = {
        type: errorType,
        message: errorMessage,
        details: error
      };

      logger.log('💾 Error guardado en store:', finalError);

      set({
        isSubmittingAttendance: false,
        status: 'error',
        error: finalError
      });
      return null;
    }
  },

  /**
   * Carga el historial de asistencias
   */
  loadAttendanceHistory: async (page: number = 1) => {
    try {
      logger.log('📋 Cargando historial de asistencias...');
      set({ isLoadingHistory: true, error: null });

      const history = await getAttendanceHistory(page);

      if (history) {
        logger.log('✅ Historial cargado exitosamente');
        set({
          attendanceHistory: history,
          isLoadingHistory: false
        });
      } else {
        logger.log('❌ Error al cargar historial');
        set({
          isLoadingHistory: false,
          error: {
            type: 'network',
            message: 'No se pudo cargar el historial de asistencias'
          }
        });
      }
    } catch (error) {
      logger.error('❌ Error al cargar historial:', error);
      set({
        isLoadingHistory: false,
        error: {
          type: 'network',
          message: 'Error al cargar historial',
          details: error
        }
      });
    }
  },

  /**
   * Carga las estadísticas de asistencia
   */
  loadAttendanceStats: async () => {
    try {
      logger.log('📊 Cargando estadísticas de asistencia...');
      set({ isLoadingStats: true, error: null });

      const stats = await getAttendanceStats();

      if (stats) {
        logger.log('✅ Estadísticas cargadas exitosamente');
        set({
          attendanceStats: stats,
          isLoadingStats: false
        });
      } else {
        logger.log('❌ Error al cargar estadísticas');
        set({
          isLoadingStats: false,
          error: {
            type: 'network',
            message: 'No se pudieron cargar las estadísticas'
          }
        });
      }
    } catch (error) {
      logger.error('❌ Error al cargar estadísticas:', error);
      set({
        isLoadingStats: false,
        error: {
          type: 'network',
          message: 'Error al cargar estadísticas',
          details: error
        }
      });
    }
  },

  /**
   * Limpia el error actual
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reinicia el flujo de asistencia
   */
  resetAttendanceFlow: () => {
    logger.log('🔄 Reiniciando flujo de asistencia');
    set({
      status: 'idle',
      error: null,
      scannedQRCode: null,
      currentAttendance: null,
      isSubmittingAttendance: false
    });
  },

  /**
   * Establece el estado manualmente
   */
  setStatus: (status: AttendanceStatus) => {
    set({ status });
  }
}));
