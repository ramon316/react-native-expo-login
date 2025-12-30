import { appLogger as logger } from '@/helpers/logger/appLogger';
import { redirectBasedOnRole } from '@/helpers/navigation/roleBasedRedirect';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Link } from 'expo-router';
import React, { useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormInput } from '@/components/ui/FormInput';
import * as WebBrowser from 'expo-web-browser';

const LoginScreen = () => {
  // Referencias para el ScrollView
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);

  // Store de autenticación
  const { login } = useAuthStore();

  /*  Se posiciona en el 35% de la pantalla, ahí iniciamos*/
  // Optimización: useMemo para evitar recalcular en cada render
  const height = useMemo(() => Dimensions.get('window').height, []);

  // Reglas de validación
  const validationRules = {
    email: (value: string) => {
      if (!value.trim()) return 'El email es requerido';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Ingrese un email válido';
      return '';
    },
    password: (value: string) => {
      if (!value) return 'La contraseña es requerida';
      if (value.length < 3) return 'La contraseña debe tener al menos 3 caracteres';
      return '';
    }
  };

  // Hook de validación de formulario (optimizado con debouncing)
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    isValid,
    setFieldValue
  } = useFormValidation(
    { email: '', password: '' },
    validationRules,
    { validateOnChange: true, validateOnBlur: true }
  );

  // Función para manejar el login (optimizado con useCallback)
  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await login(values.email.trim().toLowerCase(), values.password);

      if (success) {
        // Obtener el usuario del store después del login exitoso
        const { user } = useAuthStore.getState();

        // Redireccionar basado en el rol del usuario usando el helper
        redirectBasedOnRole(user);
      } else {
        Alert.alert('Error', 'Email o contraseña incorrectos');
        // Limpiar contraseña en caso de error
        setFieldValue('password', '');
      }
    } catch (error) {
      logger.error('❌ Error en handleLogin:', error);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  }, [values.email, values.password, login, setFieldValue]);

  // Función para abrir el navegador con la página de recuperación de contraseña
  const handleForgotPassword = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync('https://seccion8.org/forgot-password', {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#3B82F6', // Color azul consistente con el diseño
      });
    } catch (error) {
      logger.error('❌ Error al abrir navegador:', error);
      Alert.alert('Error', 'No se pudo abrir el navegador');
    }
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled={true}
      >
        {/* Espacio superior - 35% de la pantalla */}
        <View style={{ height: height * 0.35 }} className="justify-end pb-8">
          {/* Textos de bienvenida */}
          <View className="px-6">
            <Text className="text-4xl font-bold text-rose-800 mb-2">
              Bienvenido
            </Text>
            <Text className="text-gray-500 text-base">
              Por favor ingrese sus credenciales para continuar
            </Text>
          </View>
        </View>

        {/* Formulario - 65% restante */}
        <View className="flex-1 px-6 pt-8">
          {/* Campo Email - Usando componente reutilizable */}
          <FormInput
            label="Email"
            placeholder="Ingrese su email"
            value={values.email}
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          {/* Campo Contraseña - Usando componente reutilizable */}
          <FormInput
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            value={values.password}
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            error={errors.password}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          {/* Botón de Login */}
          <TouchableOpacity
            className={`py-4 rounded-lg mb-4 ${
              isLoading || !isValid
                ? 'bg-gray-300'
                : 'bg-blue-600'
            }`}
            onPress={handleLogin}
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Iniciar Sesión
              </Text>
            )}
          </TouchableOpacity>

          {/* Link para recuperar contraseña */}
          <View className="items-center mb-4">
            <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
              <Text className="text-blue-600 text-sm font-medium">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Link a registro */}
          <View className="items-center flex-row justify-center mt-4">
            <Text className="text-gray-500 text-sm mr-2">
              ¿No tienes cuenta?
            </Text>
            <Link href="/auth/register" asChild>
              <Text className="text-blue-600 text-sm font-medium">
                Crear cuenta
              </Text>
            </Link>
          </View>

          {/* Texto de ayuda */}
          <View className="items-center mt-6">
            <Text className="text-gray-400 text-xs text-center">
              ¿Problemas para ingresar?
            </Text>
            <Link href="mailto:nexusolutionsmg@gmail.com?subject=Problema%20de%20ingreso" asChild>
              <Text className='text-blue-600 text-xs text-center'>Contacte al administrador</Text>
            </Link>
            <Text className="text-gray-400 text-xs text-center">
              Asistencias Sección VIII Versión 1.0.0 © 2025
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
