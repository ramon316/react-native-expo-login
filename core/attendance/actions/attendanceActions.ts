/* Acciones para el manejo de asistencias */

import { attendancesApi } from "@/core/auth/api/attendancesApi";
import { 
  AttendanceRequest, 
  AttendanceResponse, 
  AttendanceErrorResponse,
  AttendanceHistory,
  AttendanceStats
} from "../interface/attendance";

/**
 * Registra la asistencia del usuario enviando QR code y ubicación
 * @param attendanceData - Datos de asistencia (qr_code, user_latitude, user_longitude)
 * @returns Respuesta de la API o null en caso de error
 */
export const submitAttendance = async (
  attendanceData: AttendanceRequest
): Promise<AttendanceResponse | null> => {
  try {
    console.log('📝 Registrando asistencia:', {
      qr_code: attendanceData.qr_code,
      latitude: attendanceData.user_latitude.toFixed(6),
      longitude: attendanceData.user_longitude.toFixed(6)
    });

    // Validar datos antes de enviar
    if (!attendanceData.qr_code || attendanceData.qr_code.trim() === '') {
      console.error('❌ QR code vacío o inválido');
      return null;
    }

    if (!isValidLatitude(attendanceData.user_latitude)) {
      console.error('❌ Latitud inválida:', attendanceData.user_latitude);
      return null;
    }

    if (!isValidLongitude(attendanceData.user_longitude)) {
      console.error('❌ Longitud inválida:', attendanceData.user_longitude);
      return null;
    }

    // Realizar petición a la API
    const { data } = await attendancesApi.post<AttendanceResponse>('/attendances', {
      qr_code: attendanceData.qr_code.trim(),
      user_latitude: attendanceData.user_latitude,
      user_longitude: attendanceData.user_longitude
    });

    console.log('📦 Respuesta completa de submitAttendance:', data);

    // Verificar si la respuesta es exitosa
    if (data.success && data.attendance) {
      console.log('✅ Asistencia registrada exitosamente:', {
        attendanceId: data.attendance.id,
        eventName: data.attendance.event?.name,
        distance: data.distance,
        verified: data.attendance.verified
      });
      return data;
    }

    console.log('❌ Error en la respuesta de la API:', data.message);
    return null;

  } catch (error: any) {
    console.error('❌ Error al registrar asistencia:', error);

    // Manejo específico de errores
    if (error.response?.data) {
      const errorData = error.response.data as AttendanceErrorResponse;
      console.error('📝 Mensaje del servidor:', errorData.message);
      
      if (errorData.errors) {
        console.error('📋 Errores de validación:', errorData.errors);
        
        // Log específico para cada tipo de error
        if (errorData.errors.qr_code) {
          console.error('🔍 Error QR Code:', errorData.errors.qr_code);
        }
        if (errorData.errors.user_latitude) {
          console.error('📍 Error Latitud:', errorData.errors.user_latitude);
        }
        if (errorData.errors.user_longitude) {
          console.error('📍 Error Longitud:', errorData.errors.user_longitude);
        }
      }
    }

    // Errores de red específicos
    if (error.response?.status === 422) {
      console.error('🚨 ERROR 422: Datos de validación incorrectos');
    } else if (error.response?.status === 404) {
      console.error('🚨 ERROR 404: QR code no encontrado o evento inválido');
    } else if (error.response?.status === 401) {
      console.error('🚨 ERROR 401: No autorizado - Token inválido');
    } else if (error.response?.status === 409) {
      console.error('🚨 ERROR 409: Asistencia ya registrada');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('🚨 ERROR DE RED: No se puede conectar al servidor');
    }

    return null;
  }
};

/**
 * Obtiene el historial de asistencias del usuario
 * @param page - Página para paginación (opcional)
 * @returns Historial de asistencias o null en caso de error
 */
export const getAttendanceHistory = async (page: number = 1): Promise<AttendanceHistory | null> => {
  try {
    console.log('📋 Obteniendo historial de asistencias, página:', page);

    const { data } = await attendancesApi.get(`/attendances?page=${page}`);

    console.log('📦 Respuesta de historial:', data);

    if (data.success && data.attendances) {
      console.log('✅ Historial obtenido exitosamente:', data.attendances.length, 'registros');
      return {
        attendances: data.attendances,
        total: data.total || data.attendances.length,
        current_page: data.current_page || page,
        last_page: data.last_page
      };
    }

    return null;

  } catch (error: any) {
    console.error('❌ Error al obtener historial de asistencias:', error);
    return null;
  }
};

/**
 * Obtiene estadísticas de asistencia del usuario
 * @returns Estadísticas de asistencia o null en caso de error
 */
export const getAttendanceStats = async (): Promise<AttendanceStats | null> => {
  try {
    console.log('📊 Obteniendo estadísticas de asistencia...');

    const { data } = await attendancesApi.get('/attendances/stats');

    console.log('📦 Respuesta de estadísticas:', data);

    if (data.success && data.stats) {
      console.log('✅ Estadísticas obtenidas exitosamente');
      return data.stats;
    }

    return null;

  } catch (error: any) {
    console.error('❌ Error al obtener estadísticas:', error);
    return null;
  }
};

/**
 * Valida si una latitud está en el rango correcto (-90 a 90)
 */
function isValidLatitude(lat: number): boolean {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Valida si una longitud está en el rango correcto (-180 a 180)
 */
function isValidLongitude(lng: number): boolean {
  return typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Formatea un código QR eliminando espacios y caracteres especiales
 */
export function sanitizeQRCode(qrCode: string): string {
  return qrCode.trim().replace(/\s+/g, '');
}

/**
 * Valida el formato de un código QR (UUID v4)
 */
export function isValidQRCode(qrCode: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(qrCode.trim());
}
