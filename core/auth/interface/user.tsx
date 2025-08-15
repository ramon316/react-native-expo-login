/* Interfaces para el manejo de usuarios */

/**
 * Estados de verificación del usuario
 */
export type UserStatus =
  | 'active'
  | 'pending_verification'
  | 'verification_failed'
  | 'correction_requested'
  | 'permanently_rejected';

/**
 * Roles del usuario
 */
export type UserRole = 'admin' | 'user';

/**
 * Modelo principal del usuario según la estructura de la base de datos
 */
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  password?: string; // Solo para operaciones internas, no se devuelve en respuestas
  role: UserRole;
  employee_id: string | null;
  status: UserStatus;
  verification_attempts: number;
  remember_token?: string | null;
  created_at: string;
  updated_at: string;

  // Campo adicional para autenticación
  token?: string;
}

/**
 * Datos del usuario para compatibilidad con código existente
 */
export interface UserLegacy {
  id: number;
  fullName: string; // Mapea a name
  email: string;
  isActive: boolean; // Calculado basado en status === 'active'
  roles: string[]; // Array con el rol
  token?: string;
}

/**
 * Datos para registro de usuario
 */
export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  employee_id?: string;
}

/**
 * Datos para actualización de perfil
 */
export interface UserUpdateData {
  name?: string;
  email?: string;
  employee_id?: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

/**
 * Datos de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Estados de verificación con descripciones
 */
export const UserStatusLabels: Record<UserStatus, string> = {
  active: 'Activo',
  pending_verification: 'Pendiente de Verificación',
  verification_failed: 'Verificación Fallida',
  correction_requested: 'Corrección Solicitada',
  permanently_rejected: 'Rechazado Permanentemente'
};

/**
 * Colores para los estados de verificación
 */
export const UserStatusColors: Record<UserStatus, string> = {
  active: '#10B981', // Verde
  pending_verification: '#F59E0B', // Amarillo
  verification_failed: '#EF4444', // Rojo
  correction_requested: '#F59E0B', // Amarillo
  permanently_rejected: '#6B7280' // Gris
};

/**
 * Función para convertir User a UserLegacy para compatibilidad
 */
export const userToLegacy = (user: User): UserLegacy => ({
  id: user.id,
  fullName: user.name,
  email: user.email,
  isActive: user.status === 'active',
  roles: [user.role],
  token: user.token
});

/**
 * Función para verificar si un usuario está activo
 */
export const isUserActive = (user: User): boolean => {
  return user.status === 'active';
};

/**
 * Función para verificar si un usuario es admin
 */
export const isUserAdmin = (user: User): boolean => {
  return user.role === 'admin';
};

/**
 * Función para obtener el label del estado
 */
export const getUserStatusLabel = (status: UserStatus): string => {
  return UserStatusLabels[status];
};

/**
 * Función para obtener el color del estado
 */
export const getUserStatusColor = (status: UserStatus): string => {
  return UserStatusColors[status];
};
