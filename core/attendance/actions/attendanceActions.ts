/* Acciones para el manejo de asistencias */

import { attendancesApi } from "@/core/auth/api/attendancesApi";
import {
  AttendanceErrorResponse,
  AttendanceHistory,
  AttendanceRequest,
  AttendanceResponse,
  AttendanceStats
} from "../interface/attendance";

// Logger condicional basado en el entorno
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';
const logger = {
    log: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.error(...args);
        }
        // En producción, aquí podrías enviar errores críticos a un servicio de monitoreo
    }
};

/**
 * Registra la asistencia del usuario enviando QR code y ubicación
 * @param attendanceData - Datos de asistencia (qr_code, user_latitude, user_longitude)
 * @returns Respuesta de la API o null en caso de error
 */
export const submitAttendance = async (
  attendanceData: AttendanceRequest
): Promise<AttendanceResponse | null> => {
  try {
    logger.log('📝 Registrando asistencia:', {
      qr_code: attendanceData.qr_code,
      latitude: attendanceData.user_latitude.toFixed(6),
      longitude: attendanceData.user_longitude.toFixed(6)
    });

    // Validar datos antes de enviar
    if (!attendanceData.qr_code || attendanceData.qr_code.trim() === '') {
      logger.error('❌ QR code vacío o inválido');
      return null;
    }

    if (!isValidLatitude(attendanceData.user_latitude)) {
      logger.error('❌ Latitud inválida:', attendanceData.user_latitude);
      return null;
    }

    if (!isValidLongitude(attendanceData.user_longitude)) {
      logger.error('❌ Longitud inválida:', attendanceData.user_longitude);
      return null;
    }

    // Realizar petición a la API
    const { data } = await attendancesApi.post<AttendanceResponse>('/attendances', {
      qr_code: attendanceData.qr_code.trim(),
      user_latitude: attendanceData.user_latitude,
      user_longitude: attendanceData.user_longitude
    });

    logger.log('📦 Respuesta completa de submitAttendance:', data);

    // Verificar si la respuesta es exitosa
    if (data.success && data.attendance) {
      logger.log('✅ Asistencia registrada exitosamente:', {
        attendanceId: data.attendance.id,
        eventName: data.attendance.event?.name,
        distance: data.distance,
        verified: data.attendance.verified
      });
      return data;
    }

    logger.log('❌ Error en la respuesta de la API:', data.message);
    return null;

  } catch (error: any) {
    logger.error('❌ Error al registrar asistencia:', error);

    // Manejo específico de errores
    if (error.response?.data) {
      const errorData = error.response.data as AttendanceErrorResponse;
      logger.error('📝 Mensaje del servidor:', errorData.message);

      if (errorData.errors) {
        logger.error('📋 Errores de validación:', errorData.errors);

        // Log específico para cada tipo de error
        if (errorData.errors.qr_code) {
          logger.error('🔍 Error QR Code:', errorData.errors.qr_code);
        }
        if (errorData.errors.user_latitude) {
          logger.error('📍 Error Latitud:', errorData.errors.user_latitude);
        }
        if (errorData.errors.user_longitude) {
          logger.error('📍 Error Longitud:', errorData.errors.user_longitude);
        }
      }
    }

    // Errores de red específicos
    if (error.response?.status === 422) {
      logger.error('🚨 ERROR 422: Datos de validación incorrectos');
    } else if (error.response?.status === 404) {
      logger.error('🚨 ERROR 404: QR code no encontrado o evento inválido');
    } else if (error.response?.status === 401) {
      logger.error('🚨 ERROR 401: No autorizado - Token inválido');
    } else if (error.response?.status === 409) {
      logger.error('🚨 ERROR 409: Asistencia ya registrada');
    } else if (error.code === 'NETWORK_ERROR') {
      logger.error('🚨 ERROR DE RED: No se puede conectar al servidor');
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
    logger.log('📋 Obteniendo historial de asistencias, página:', page);

    const { data } = await attendancesApi.get(`/attendances?page=${page}`);

    logger.log('📦 Respuesta de historial:', data);

    if (data.success && data.attendances) {
      logger.log('✅ Historial obtenido exitosamente:', data.attendances.length, 'registros');
      return {
        attendances: data.attendances,
        total: data.total || data.attendances.length,
        current_page: data.current_page || page,
        last_page: data.last_page
      };
    }

    return null;

  } catch (error: any) {
    logger.error('❌ Error al obtener historial de asistencias:', error);
    return null;
  }
};

/**
 * Obtiene estadísticas de asistencia del usuario
 * @returns Estadísticas de asistencia o null en caso de error
 */
export const getAttendanceStats = async (): Promise<AttendanceStats | null> => {
  try {
    logger.log('📊 Obteniendo estadísticas de asistencia...');

    const { data } = await attendancesApi.get('/attendances/stats');

    logger.log('📦 Respuesta de estadísticas:', data);

    if (data.success && data.stats) {
      logger.log('✅ Estadísticas obtenidas exitosamente');
      return data.stats;
    }

    return null;

  } catch (error: any) {
    logger.error('❌ Error al obtener estadísticas:', error);
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
