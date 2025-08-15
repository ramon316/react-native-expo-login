/* Acciones para el manejo de asistencias del usuario */

import { attendancesApi } from "@/core/auth/api/attendancesApi";
import {
    AttendancesByDate,
    AttendancesByEvent,
    GetMyAttendancesParams,
    MyAttendancesResponse,
    UserAttendance,
    UserAttendanceStats
} from "../interface/userAttendance";

/**
 * Obtiene las asistencias del usuario autenticado
 * @param params - Parámetros opcionales para filtros y paginación
 * @returns Lista de asistencias del usuario o null en caso de error
 */
export const getMyAttendances = async (params?: GetMyAttendancesParams): Promise<UserAttendance[] | null> => {
  try {
    console.log('📋 Obteniendo asistencias del usuario...', params);

    // Verificar token antes de hacer la petición
    const { SecureStorageAdapter } = await import('@/helpers/adapters/secure-storage.adapter');
    const token = await SecureStorageAdapter.getItem('token');
    console.log('🔍 Token verificado en getMyAttendances:', token ? `${token.substring(0, 20)}...` : 'NO ENCONTRADO');

    // Construir parámetros de query
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    // Agregar filtros si existen
    if (params?.filters) {
      if (params.filters.verified !== undefined) {
        queryParams.append('verified', params.filters.verified.toString());
      }
      if (params.filters.startDate) {
        queryParams.append('start_date', params.filters.startDate);
      }
      if (params.filters.endDate) {
        queryParams.append('end_date', params.filters.endDate);
      }
      if (params.filters.eventName) {
        queryParams.append('event_name', params.filters.eventName);
      }
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/attendances/my?${queryString}` : '/attendances/my';

    const { data } = await attendancesApi.get<MyAttendancesResponse>(url);

    console.log('📦 Respuesta completa de getMyAttendances:', data);

    if (data.success && data.attendances) {
      console.log('✅ Asistencias obtenidas exitosamente:', data.attendances.length);
      return data.attendances;
    } else {
      console.log('❌ Error en la respuesta:', data.message);
      return null;
    }

  } catch (error: any) {
    console.error('❌ Error al obtener asistencias del usuario:', error);

    // Manejo específico de errores
    if (error.response?.status === 401) {
      console.error('🚨 ERROR 401: No autorizado - Token inválido');
    } else if (error.response?.status === 404) {
      console.error('🚨 ERROR 404: Endpoint no encontrado');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('🚨 ERROR DE RED: No se puede conectar al servidor');
    }

    return null;
  }
};

/**
 * Obtiene estadísticas de asistencias del usuario
 * @returns Estadísticas de asistencias o null en caso de error
 */
export const getMyAttendanceStats = async (): Promise<UserAttendanceStats | null> => {
  try {
    console.log('📊 Obteniendo estadísticas de asistencias del usuario...');

    // Verificar token antes de hacer la petición
    const { SecureStorageAdapter } = await import('@/helpers/adapters/secure-storage.adapter');
    const token = await SecureStorageAdapter.getItem('token');
    console.log('🔍 Token verificado:', token ? `${token.substring(0, 20)}...` : 'NO ENCONTRADO');

    const { data } = await attendancesApi.get('/attendances/my/stats');

    console.log('📦 Respuesta de estadísticas:', data);

    if (data.success && data.stats) {
      console.log('✅ Estadísticas obtenidas exitosamente');
      return data.stats;
    }

    return null;

  } catch (error: any) {
    console.error('❌ Error al obtener estadísticas:', error);

    // Fallback: calcular estadísticas localmente usando /attendances/my
    console.log('🔄 Intentando calcular estadísticas localmente como fallback...');
    try {
      const attendances = await getMyAttendances();
      if (attendances && attendances.length > 0) {
        console.log('✅ Calculando estadísticas localmente con', attendances.length, 'asistencias');
        return calculateAttendanceStats(attendances);
      }
    } catch (fallbackError) {
      console.error('❌ Error en fallback:', fallbackError);
    }

    return null;
  }
};

/**
 * Agrupa las asistencias por evento
 * @param attendances - Lista de asistencias
 * @returns Asistencias agrupadas por evento
 */
export const groupAttendancesByEvent = (attendances: UserAttendance[]): AttendancesByEvent[] => {
  const grouped = attendances.reduce((acc, attendance) => {
    const eventId = attendance.event.id;
    
    if (!acc[eventId]) {
      acc[eventId] = {
        event: attendance.event,
        attendances: [],
        total_attendances: 0,
        verified_count: 0,
        average_distance: 0,
        first_attendance: attendance.checked_in_at,
        last_attendance: attendance.checked_in_at
      };
    }

    acc[eventId].attendances.push(attendance);
    acc[eventId].total_attendances++;
    
    if (attendance.verified) {
      acc[eventId].verified_count++;
    }

    // Actualizar fechas
    if (attendance.checked_in_at < acc[eventId].first_attendance) {
      acc[eventId].first_attendance = attendance.checked_in_at;
    }
    if (attendance.checked_in_at > acc[eventId].last_attendance) {
      acc[eventId].last_attendance = attendance.checked_in_at;
    }

    return acc;
  }, {} as Record<number, AttendancesByEvent>);

  // Calcular distancia promedio para cada evento
  Object.values(grouped).forEach(group => {
    const totalDistance = group.attendances.reduce((sum, att) => sum + parseFloat(att.distance_meters), 0);
    group.average_distance = totalDistance / group.attendances.length;
  });

  return Object.values(grouped);
};

/**
 * Agrupa las asistencias por fecha
 * @param attendances - Lista de asistencias
 * @returns Asistencias agrupadas por fecha
 */
export const groupAttendancesByDate = (attendances: UserAttendance[]): AttendancesByDate[] => {
  const grouped = attendances.reduce((acc, attendance) => {
    const date = attendance.checked_in_at.split('T')[0]; // Extraer solo la fecha YYYY-MM-DD
    
    if (!acc[date]) {
      acc[date] = {
        date,
        attendances: [],
        events_count: 0
      };
    }

    acc[date].attendances.push(attendance);
    
    // Contar eventos únicos
    const uniqueEvents = new Set(acc[date].attendances.map(att => att.event.id));
    acc[date].events_count = uniqueEvents.size;

    return acc;
  }, {} as Record<string, AttendancesByDate>);

  // Ordenar por fecha descendente (más reciente primero)
  return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Filtra asistencias por criterios específicos
 * @param attendances - Lista de asistencias
 * @param verified - Solo asistencias verificadas
 * @returns Asistencias filtradas
 */
export const filterAttendances = (
  attendances: UserAttendance[], 
  verified?: boolean
): UserAttendance[] => {
  let filtered = [...attendances];

  if (verified !== undefined) {
    filtered = filtered.filter(att => att.verified === verified);
  }

  return filtered;
};

/**
 * Busca asistencias por nombre del evento
 * @param attendances - Lista de asistencias
 * @param searchTerm - Término de búsqueda
 * @returns Asistencias que coinciden con la búsqueda
 */
export const searchAttendancesByEventName = (
  attendances: UserAttendance[], 
  searchTerm: string
): UserAttendance[] => {
  if (!searchTerm.trim()) {
    return attendances;
  }

  const term = searchTerm.toLowerCase().trim();
  return attendances.filter(attendance => 
    attendance.event.name.toLowerCase().includes(term) ||
    attendance.event.description?.toLowerCase().includes(term)
  );
};

/**
 * Calcula estadísticas básicas de una lista de asistencias
 * @param attendances - Lista de asistencias
 * @returns Estadísticas calculadas
 */
export const calculateAttendanceStats = (attendances: UserAttendance[]): UserAttendanceStats => {
  const verified = attendances.filter(att => att.verified);
  const unverified = attendances.filter(att => !att.verified);
  
  const uniqueEvents = new Set(attendances.map(att => att.event.id));
  
  const totalDistance = attendances.reduce((sum, att) => sum + parseFloat(att.distance_meters), 0);
  const averageDistance = attendances.length > 0 ? totalDistance / attendances.length : 0;

  // Obtener las 5 asistencias más recientes
  const recent = [...attendances]
    .sort((a, b) => new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime())
    .slice(0, 5);

  return {
    total_attendances: attendances.length,
    verified_attendances: verified.length,
    unverified_attendances: unverified.length,
    events_attended: uniqueEvents.size,
    average_distance: Math.round(averageDistance * 100) / 100, // Redondear a 2 decimales
    recent_attendances: recent
  };
};

/**
 * Función de diagnóstico para verificar la conectividad de la API
 * @returns Información de diagnóstico
 */
export const diagnoseApiConnection = async (): Promise<void> => {
  console.log('🔍 === DIAGNÓSTICO DE API ===');

  try {
    // Verificar configuración base
    console.log('🌐 Base URL:', attendancesApi.defaults.baseURL);
    console.log('🔑 Headers por defecto:', JSON.stringify(attendancesApi.defaults.headers, null, 2));

    // Probar endpoint que funciona
    console.log('🧪 Probando /attendances/my...');
    const myAttendances = await attendancesApi.get('/attendances/my');
    console.log('✅ /attendances/my - Status:', myAttendances.status);

    // Probar endpoint problemático
    console.log('🧪 Probando /attendances/my/stats...');
    const myStats = await attendancesApi.get('/attendances/my/stats');
    console.log('✅ /attendances/my/stats - Status:', myStats.status);

  } catch (error: any) {
    console.error('❌ Error en diagnóstico:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });
  }

  console.log('🔍 === FIN DIAGNÓSTICO ===');
};
