/* Interfaces para las asistencias del usuario */

import { Event } from "@/core/event/interface/event";

/**
 * Registro de asistencia del usuario con información del evento
 */
export interface UserAttendance {
  id: number;
  event_id: number;
  user_id: number;
  user_latitude: string;
  user_longitude: string;
  distance_meters: string;
  verified: boolean;
  checked_in_at: string; // ISO format: "2025-08-13T18:49:31.000000Z"
  created_at: string;
  updated_at: string;
  // Relación con el evento
  event: Event;
}

/**
 * Respuesta de la API para obtener asistencias del usuario
 */
export interface MyAttendancesResponse {
  success: boolean;
  message: string;
  attendances: UserAttendance[];
}

/**
 * Estados de carga para las asistencias del usuario
 */
export type UserAttendanceLoadingStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Filtros para las asistencias del usuario
 */
export interface UserAttendanceFilters {
  verified?: boolean;     // Solo asistencias verificadas
  startDate?: string;     // Fecha de inicio (ISO)
  endDate?: string;       // Fecha de fin (ISO)
  eventName?: string;     // Filtrar por nombre del evento
}

/**
 * Estadísticas de asistencias del usuario
 */
export interface UserAttendanceStats {
  total_attendances: number;
  verified_attendances: number;
  unverified_attendances: number;
  events_attended: number;
  average_distance: number;
  recent_attendances: UserAttendance[];
}

/**
 * Datos agrupados por evento
 */
export interface AttendancesByEvent {
  event: Event;
  attendances: UserAttendance[];
  total_attendances: number;
  verified_count: number;
  average_distance: number;
  first_attendance: string;
  last_attendance: string;
}

/**
 * Datos agrupados por fecha
 */
export interface AttendancesByDate {
  date: string; // YYYY-MM-DD
  attendances: UserAttendance[];
  events_count: number;
}

/**
 * Parámetros para obtener asistencias del usuario
 */
export interface GetMyAttendancesParams {
  page?: number;
  limit?: number;
  filters?: UserAttendanceFilters;
}

/**
 * Respuesta paginada de asistencias
 */
export interface PaginatedAttendancesResponse extends MyAttendancesResponse {
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}
