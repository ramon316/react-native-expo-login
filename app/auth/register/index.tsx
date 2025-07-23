import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Link, router } from 'expo-router';
import React, { useRef, useState } from 'react';
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

const RegisterScreen = () => {
  // Referencias para el ScrollView y campos
  const scrollViewRef = useRef<ScrollView>(null);

  // Store de autenticación
  const { register } = useAuthStore();

  // Estados locales para el formulario
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para errores de validación
  const [errors, setErrors] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  /*  Se posiciona en el 20% de la pantalla para más espacio al formulario*/
  const { height } = useWindowDimensions();

  // Funciones de validación
  const validateFullName = (name: string) => {
    if (!name.trim()) return 'El nombre completo es requerido';
    if (name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return 'El nombre solo puede contener letras';
    return '';
  };

  const validateEmployeeId = (id: string) => {
    if (!id.trim()) return 'La matrícula es requerida';
    if (id.trim().length < 3) return 'La matrícula debe tener al menos 3 caracteres';
    if (!/^[a-zA-Z0-9]+$/.test(id)) return 'La matrícula solo puede contener letras y números';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Ingrese un email válido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) return 'Debe contener al menos una mayúscula y una minúscula';
    if (!/(?=.*\d)/.test(password)) return 'Debe contener al menos un número';
    return '';
  };

  const validateConfirmPassword = (confirmPass: string, originalPass: string) => {
    if (!confirmPass) return 'Confirme su contraseña';
    if (confirmPass !== originalPass) return 'Las contraseñas no coinciden';
    return '';
  };

  // Validar campo individual
  const validateField = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'employeeId':
        error = validateEmployeeId(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, password);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  // Validar todo el formulario
  const validateForm = () => {
    const fullNameValid = validateField('fullName', fullName);
    const employeeIdValid = validateField('employeeId', employeeId);
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    const confirmPasswordValid = validateField('confirmPassword', confirmPassword);

    return fullNameValid && employeeIdValid && emailValid && passwordValid && confirmPasswordValid;
  };

  // Función para manejar el registro
  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    setIsLoading(true);
    try {
      console.log('📝 Iniciando registro con datos:', {
        fullName: fullName.trim(),
        employeeId: employeeId.trim(),
        email: email.trim().toLowerCase(),
        password: '***' // No mostrar contraseña en logs
      });

      const success = await register(
        fullName.trim(),
        employeeId.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword
      );

      if (success) {
        Alert.alert(
          'Registro Exitoso',
          'Su cuenta ha sido creada correctamente. Será redirigido automáticamente.',
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/(attendances-app)/(home)')
            }
          ]
        );
      } else {
        Alert.alert(
          'Error de Registro',
          'No se pudo crear la cuenta. Verifique los datos e intente nuevamente.'
        );
      }

    } catch (error) {
      console.error('Error en handleRegister:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    return fullName.trim() &&
           employeeId.trim() &&
           email.trim() &&
           password &&
           confirmPassword &&
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
        {/* Espacio superior - 20% de la pantalla */}
        <View style={{ height: height * 0.20 }} className="justify-end pb-8">
          {/* Textos de bienvenida */}
          <View className="px-6">
            <Text className="text-4xl font-bold text-gray-800 mb-2">
              Crear Cuenta
            </Text>
            <Text className="text-3xl font-bold text-blue-600 mb-4">
              Registro
            </Text>
            <Text className="text-gray-500 text-base">
              Complete el formulario para crear su cuenta
            </Text>
          </View>
        </View>

        {/* Formulario - 80% restante */}
        <View className="flex-1 px-6">
          {/* Campo Nombre Completo */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Nombre completo
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.fullName ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Ingrese su nombre completo"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) validateField('fullName', text);
              }}
              onBlur={() => validateField('fullName', fullName)}
              autoCorrect={false}
              autoCapitalize='words'
              editable={!isLoading}
            />
            {errors.fullName ? (
              <Text className="text-red-500 text-xs mt-1">{errors.fullName}</Text>
            ) : null}
          </View>

          {/* Campo Matrícula */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Matrícula
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.employeeId ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Ingrese su matrícula"
              placeholderTextColor="#9CA3AF"
              value={employeeId}
              onChangeText={(text) => {
                setEmployeeId(text);
                if (errors.employeeId) validateField('employeeId', text);
              }}
              onBlur={() => validateField('employeeId', employeeId)}
              autoCorrect={false}
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.employeeId ? (
              <Text className="text-red-500 text-xs mt-1">{errors.employeeId}</Text>
            ) : null}
          </View>

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
          <View className="mb-4">
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
                // Re-validar confirmPassword si ya tiene valor
                if (confirmPassword && errors.confirmPassword) {
                  validateField('confirmPassword', confirmPassword);
                }
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

          {/* Campo Confirmar Contraseña */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Confirmar contraseña
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="Confirme su contraseña"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) validateField('confirmPassword', text);
              }}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity
            className={`py-4 rounded-lg mb-4 ${
              isLoading || !isFormValid()
                ? 'bg-gray-300'
                : 'bg-blue-600'
            }`}
            onPress={handleRegister}
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Crear Cuenta
              </Text>
            )}
          </TouchableOpacity>

          {/* Link a login */}
          <View className="items-center flex-row justify-center mt-4">
            <Text className="text-gray-500 text-sm mr-2">
              ¿Ya tienes una cuenta?
            </Text>
            <Link href="/auth/login" className="text-blue-600 text-sm font-medium">
              Iniciar sesión
            </Link>
          </View>

          {/* Texto de ayuda */}
          <View className="items-center mt-6">
            <Text className="text-gray-400 text-xs text-center">
              Al crear una cuenta, aceptas nuestros términos y condiciones
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;