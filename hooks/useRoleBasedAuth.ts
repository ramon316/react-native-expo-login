import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { isAdmin, isUser, getRouteByRole } from '@/helpers/navigation/roleBasedRedirect';

/**
 * Hook personalizado para manejar autenticación basada en roles
 * Proporciona utilidades para verificar roles y obtener información del usuario
 */
export const useRoleBasedAuth = () => {
  const { user, status, token } = useAuthStore();

  return {
    // Información del usuario
    user,
    status,
    token,
    
    // Verificaciones de rol
    isAdmin: isAdmin(user),
    isUser: isUser(user),
    
    // Utilidades
    userRole: user?.role,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'checking',
    
    // Navegación
    getHomeRoute: () => getRouteByRole(user),
    
    // Verificaciones específicas
    canAccessAdminPanel: () => isAdmin(user) && status === 'authenticated',
    canAccessUserFeatures: () => (isUser(user) || isAdmin(user)) && status === 'authenticated',
  };
};

/**
 * Hook para proteger rutas basado en roles
 * @param requiredRole - Rol requerido para acceder a la ruta
 * @returns objeto con información de acceso
 */
export const useRoleProtection = (requiredRole: 'admin' | 'user' | 'any' = 'any') => {
  const { user, status, isAdmin, isUser } = useRoleBasedAuth();

  const hasAccess = () => {
    if (status !== 'authenticated') return false;
    
    switch (requiredRole) {
      case 'admin':
        return isAdmin;
      case 'user':
        return isUser || isAdmin; // Admin puede acceder a rutas de usuario
      case 'any':
        return true;
      default:
        return false;
    }
  };

  return {
    hasAccess: hasAccess(),
    isLoading: status === 'checking',
    user,
    redirectRoute: getRouteByRole(user),
  };
};
