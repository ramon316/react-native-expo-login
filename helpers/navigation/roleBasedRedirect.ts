import { User } from '@/core/auth/interface/user';
import { appLogger as logger } from '@/helpers/logger/appLogger';
import { router } from 'expo-router';

/**
 * Redirige al usuario a la pantalla apropiada basada en su rol
 * @param user - Usuario autenticado
 */
export const redirectBasedOnRole = (user: User | undefined) => {
  if (!user) {
    logger.log('❌ No hay usuario para redireccionar');
    return;
  }

  logger.log('👤 Usuario:', user.name);
  logger.log('🔑 Rol del usuario:', user.role);

  switch (user.role) {
    case 'admin':
      logger.log('🔄 Redirigiendo a admin dashboard...');
      router.replace('/(admin-app)/(dashboard)');
      break;

    case 'user':
    default:
      logger.log('🔄 Redirigiendo a home de usuario...');
      router.replace('/(attendances-app)/(home)');
      break;
  }
};

/**
 * Obtiene la ruta apropiada basada en el rol del usuario
 * @param user - Usuario autenticado
 * @returns string - Ruta de redirección
 */
export const getRouteByRole = (user: User | undefined): string => {
  if (!user) {
    return '/(attendances-app)/(home)'; // Ruta por defecto
  }

  switch (user.role) {
    case 'admin':
      return '/(admin-app)/(dashboard)';
    
    case 'user':
    default:
      return '/(attendances-app)/(home)';
  }
};

/**
 * Verifica si el usuario tiene permisos de administrador
 * @param user - Usuario a verificar
 * @returns boolean - true si es admin
 */
export const isAdmin = (user: User | undefined): boolean => {
  return user?.role === 'admin';
};

/**
 * Verifica si el usuario es un usuario normal
 * @param user - Usuario a verificar
 * @returns boolean - true si es usuario normal
 */
export const isUser = (user: User | undefined): boolean => {
  return user?.role === 'user' || (!user?.role && user !== undefined);
};
