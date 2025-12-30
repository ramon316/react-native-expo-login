import { Redirect } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useEffect } from 'react';
import { AuthCheckSkeleton } from '@/components/ui/SkeletonLoader';
import { appLogger as logger } from '@/helpers/logger/appLogger';

export default function Index() {
  const { status, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    logger.log('📱 App Index - Iniciando verificación de autenticación');
    checkAuthStatus();
  }, []);

  // Mientras verifica autenticación, mostrar skeleton
  if (status === 'checking') {
    logger.log('⏳ App Index - Verificando autenticación...');
    return <AuthCheckSkeleton />;
  }

  // Si está autenticado, redirigir a la app de asistencias
  // El layout de attendances-app se encargará de verificar el rol y redirigir si es admin
  if (status === 'authenticated') {
    logger.log('✅ App Index - Usuario autenticado, redirigiendo a attendances-app');
    return <Redirect href="/(attendances-app)/(home)" />;
  }

  // Si no está autenticado, redirigir al login
  logger.log('❌ App Index - Usuario no autenticado, redirigiendo a login');
  return <Redirect href="/auth/login" />;
}
