/* Interfaces para el manejo de asistencias */

import { User } from "@/core/auth/interface/user";
import { Event } from "@/core/event/interface/event";

/**
 * Datos requeridos para registrar asistencia
 * Basado en la validación Laravel: qr_code, user_latitude, user_longitude
 */
export interface AttendanceRequest {
  qr_code: string;
  user_latitude: number;  // between -90,90
  user_longitude: number; // between -180,180
}

/**
 * Respuesta de la API al registrar asistencia exitosamente
 */
export interface AttendanceResponse {
  success: boolean;
  message: string;
  attendance: Attendance;
  distance: number; // Distancia en metros desde el evento
}

/**
 * Modelo de asistencia completo
 */
export interface Attendance {
  id: number;
  event_id: number;
  user_id: number;
  user_latitude: number;
  user_longitude: number;
  distance_meters: number;
  verified: boolean;
  checked_in_at: string; // ISO format: "2025-08-03T14:30:21.000000Z"
  created_at: string;
  updated_at: string;
  // Relaciones incluidas en la respuesta
  event: Event;
  user: User;
}

/**
 * Estados posibles para el proceso de registro de asistencia
 */
export type AttendanceStatus = 
  | 'idle'           // Estado inicial
  | 'requesting-location' // Solicitando permisos y ubicación
  | 'scanning'       // Escaneando QR
  | 'submitting'     // Enviando datos a la API
  | 'success'        // Registro exitoso
  | 'error';         // Error en el proceso

/**
 * Errores específicos del sistema de asistencias
 */
export interface AttendanceError {
  type: 'location' | 'qr' | 'network' | 'validation' | 'permission' | 'invalid_qr' | 'already_registered' | 'forbidden' | 'out_of_range' | 'event_inactive' | 'event_not_started' | 'unauthorized';
  message: string;
  details?: any;
}

/**
 * Datos de ubicación del usuario
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

/**
 * Configuración para obtener ubicación
 */
export interface LocationConfig {
  accuracy: 'low' | 'balanced' | 'high' | 'highest';
  timeout: number; // milisegundos
  maximumAge: number; // milisegundos
}

/**
 * Respuesta de error de la API
 */
export interface AttendanceErrorResponse {
  success: false;
  message: string;
  errors?: {
    qr_code?: string[];
    user_latitude?: string[];
    user_longitude?: string[];
  };
}

/**
 * Historial de asistencias del usuario
 */
export interface AttendanceHistory {
  attendances: Attendance[];
  total: number;
  current_page?: number;
  last_page?: number;
}

/**
 * Estadísticas de asistencia
 */
export interface AttendanceStats {
  total_events: number;
  attended_events: number;
  attendance_rate: number; // Porcentaje
  recent_attendances: Attendance[];
}
