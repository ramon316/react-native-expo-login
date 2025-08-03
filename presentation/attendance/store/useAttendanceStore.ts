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
      console.log('🔐 Solicitando permisos de ubicación...');
      set({ status: 'requesting-location', error: null });

      const result = await LocationService.requestLocationPermissions();
      
      if (result.granted) {
        console.log('✅ Permisos concedidos');
        set({ 
          locationPermissionGranted: true,
          status: 'idle',
          error: null 
        });
        return true;
      } else {
        console.log('❌ Permisos denegados');
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
      console.error('❌ Error al solicitar permisos:', error);
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
      console.log('📍 Obteniendo ubicación actual...');
      set({ isLoadingLocation: true, error: null });

      const result = await LocationService.getCurrentLocation();
      
      if (result.location) {
        console.log('✅ Ubicación obtenida exitosamente');
        set({ 
          userLocation: result.location,
          isLoadingLocation: false,
          error: null 
        });
        return true;
      } else {
        console.log('❌ Error al obtener ubicación');
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
      console.error('❌ Error inesperado al obtener ubicación:', error);
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
    console.log('📱 QR Code escaneado:', qrCode);
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
        console.error('❌ No hay ubicación disponible');
        set({ 
          error: {
            type: 'location',
            message: 'Se requiere ubicación para registrar asistencia'
          }
        });
        return false;
      }

      console.log('📝 Enviando registro de asistencia...');
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
      
      if (result) {
        console.log('✅ Asistencia registrada exitosamente');
        set({
          currentAttendance: result.attendance,
          isSubmittingAttendance: false,
          status: 'success',
          error: null
        });
        return result.attendance;
      } else {
        console.log('❌ Error al registrar asistencia');
        set({
          isSubmittingAttendance: false,
          status: 'error',
          error: {
            type: 'network',
            message: 'No se pudo registrar la asistencia'
          }
        });
        return null;
      }
    } catch (error) {
      console.error('❌ Error inesperado al registrar asistencia:', error);
      set({ 
        isSubmittingAttendance: false,
        status: 'error',
        error: {
          type: 'network',
          message: 'Error inesperado al registrar asistencia',
          details: error
        }
      });
      return null;
    }
  },

  /**
   * Carga el historial de asistencias
   */
  loadAttendanceHistory: async (page: number = 1) => {
    try {
      console.log('📋 Cargando historial de asistencias...');
      set({ isLoadingHistory: true, error: null });

      const history = await getAttendanceHistory(page);
      
      if (history) {
        console.log('✅ Historial cargado exitosamente');
        set({ 
          attendanceHistory: history,
          isLoadingHistory: false 
        });
      } else {
        console.log('❌ Error al cargar historial');
        set({ 
          isLoadingHistory: false,
          error: {
            type: 'network',
            message: 'No se pudo cargar el historial de asistencias'
          }
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
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
      console.log('📊 Cargando estadísticas de asistencia...');
      set({ isLoadingStats: true, error: null });

      const stats = await getAttendanceStats();
      
      if (stats) {
        console.log('✅ Estadísticas cargadas exitosamente');
        set({ 
          attendanceStats: stats,
          isLoadingStats: false 
        });
      } else {
        console.log('❌ Error al cargar estadísticas');
        set({ 
          isLoadingStats: false,
          error: {
            type: 'network',
            message: 'No se pudieron cargar las estadísticas'
          }
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
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
    console.log('🔄 Reiniciando flujo de asistencia');
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
