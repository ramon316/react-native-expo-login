import { redirectBasedOnRole } from '@/helpers/navigation/roleBasedRedirect';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

const LoginScreen = () => {
  // Referencias para el ScrollView
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Estados locales para el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para errores de validación
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Store de autenticación
  const { login } = useAuthStore();

  /*  Se posiciona en el 35% de la pantalla, ahí iniciamos*/
  const { height } = useWindowDimensions();

  // Funciones de validación
  const validateEmail = (email: string) => {
    if (!email.trim()) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Ingrese un email válido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 3) return 'La contraseña debe tener al menos 3 caracteres';
    return '';
  };

  // Validar campo individual
  const validateField = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  // Validar todo el formulario
  const validateForm = () => {
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    return emailValid && passwordValid;
  };

  // Función para manejar el login
  const handleLogin = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim().toLowerCase(), password);

      if (success) {
        // Obtener el usuario del store después del login exitoso
        const { user } = useAuthStore.getState();

        // Redireccionar basado en el rol del usuario usando el helper
        redirectBasedOnRole(user);
      } else {
        Alert.alert('Error', 'Email o contraseña incorrectos');
        // Limpiar contraseña en caso de error
        setPassword('');
        setErrors(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('❌ Error en handleLogin:', error);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    return email.trim() &&
           password &&
           Object.values(errors).every(error => error === '');
  };

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
            <Text className="text-4xl font-bold text-gray-800 mb-2">
              Bienvenido
            </Text>
            <Text className="text-3xl font-bold text-blue-600 mb-4">
              Ingresar
            </Text>
            <Text className="text-gray-500 text-base">
              Por favor ingrese sus credenciales para continuar
            </Text>
          </View>
        </View>

        {/* Formulario - 65% restante */}
        <View className="flex-1 px-6 pt-8">
          {/* Campo Email */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Email
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Ingrese su email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) validateField('email', text);
              }}
              onBlur={() => validateField('email', email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.email ? (
              <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
            ) : null}
          </View>

          {/* Campo Contraseña */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Contraseña
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Ingrese su contraseña"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) validateField('password', text);
              }}
              onBlur={() => validateField('password', password)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.password ? (
              <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
            ) : null}
          </View>

          {/* Botón de Login */}
          <TouchableOpacity
            className={`py-4 rounded-lg mb-4 ${
              isLoading || !isFormValid()
                ? 'bg-gray-300'
                : 'bg-blue-600'
            }`}
            onPress={handleLogin}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Iniciar Sesión
              </Text>
            )}
          </TouchableOpacity>

          {/* Link a registro */}
          <View className="items-center flex-row justify-center mt-4">
            <Text className="text-gray-500 text-sm mr-2">
              ¿No tienes cuenta?
            </Text>
            <Link href="/auth/register" className="text-blue-600 text-sm font-medium">
              Crear cuenta
            </Link>
          </View>

          {/* Texto de ayuda */}
          <View className="items-center mt-6">
            <Text className="text-gray-400 text-xs text-center">
              ¿Problemas para ingresar? Contacte al administrador
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;