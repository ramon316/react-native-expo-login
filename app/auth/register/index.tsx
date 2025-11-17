import { validateMatricula } from '@/core/auth/actions/authActions';
import { appLogger as logger } from '@/helpers/logger/appLogger';
import { redirectBasedOnRole } from '@/helpers/navigation/roleBasedRedirect';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useRef, useState, useMemo, useCallback } from 'react';
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
import CustomCheckbox from './components/CustomCheckbox';
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormInput } from '@/components/ui/FormInput';

const RegisterScreen = () => {
  // Referencias para el ScrollView y campos
  const scrollViewRef = useRef<ScrollView>(null);

  // Store de autenticación
  const { register } = useAuthStore();

  // Estados locales para el formulario
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para validación de matrícula
  const [isValidatingMatricula, setIsValidatingMatricula] = useState(false);
  const [matriculaValidated, setMatriculaValidated] = useState<boolean | null>(null);
  const [showMatriculaConfirmation, setShowMatriculaConfirmation] = useState(false);

  // Estados para checkboxes obligatorios
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedLocation, setAcceptedLocation] = useState(false);

  // Estados para errores de validación
  const [errors, setErrors] = useState({
    name: '',
    employeeId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  /*  Se posiciona en el 20% de la pantalla para más espacio al formulario*/
  // Optimización: useMemo para evitar recalcular en cada render
  const height = useMemo(() => Dimensions.get('window').height, []);

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
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) return 'Debe contener al menos una mayúscula y una minúscula';
    if (!/(?=.*\d)/.test(password)) return 'Debe contener al menos un número';
    return '';
  };

  const validateConfirmPassword = (confirmPass: string, originalPass: string) => {
    if (!confirmPass) return 'Confirme su contraseña';
    if (confirmPass !== originalPass) return 'Las contraseñas no coinciden';
    return '';
  };

  // Validar campo individual (optimizado con useCallback)
  const validateField = useCallback((field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'name':
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
  }, [password]); // password es necesario para validar confirmPassword

  // Validar todo el formulario
  const validateForm = () => {
    const nameValid = validateField('name', name);
    const employeeIdValid = validateField('employeeId', employeeId);
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    const confirmPasswordValid = validateField('confirmPassword', confirmPassword);

    return nameValid && employeeIdValid && emailValid && passwordValid && confirmPasswordValid;
  };

  // Función para manejar el registro
  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrija los errores en el formulario');
      return;
    }

    // Validar matrícula antes del registro si no está validada
    if (matriculaValidated === null) {
      logger.log('🔍 Validando matrícula antes del registro...');
      await handleValidateMatricula(employeeId);
      return; // Esperar a que se complete la validación
    }

    // Si la matrícula no fue encontrada, mostrar confirmación
    if (matriculaValidated === false && !showMatriculaConfirmation) {
      setShowMatriculaConfirmation(true);
      return;
    }

    setIsLoading(true);
    try {
      logger.log('📝 Iniciando registro con datos:', {
        name: name.trim(),
        employeeId: employeeId.trim(),
        email: email.trim().toLowerCase(),
        password: '***', // No mostrar contraseña en logs
        matriculaValidated: matriculaValidated
      });

      const success = await register(
        name.trim(),
        employeeId.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword,
        matriculaValidated || false // Pasar el estado de validación de matrícula
      );

      if (success) {
        // Obtener el usuario del store después del registro exitoso
        const { user } = useAuthStore.getState();

        logger.log('👤 Usuario registrado:', user);
        logger.log('🔑 Rol del usuario:', user?.role);

        // Mensaje personalizado según el estado de la matrícula
        const title = '✅ Cuenta Creada';
        let message = '';

        if (matriculaValidated === false) {
          message = 'Tu cuenta ha sido creada pero quedará pendiente de verificación manual debido a que tu matrícula no fue encontrada en nuestros registros. Te notificaremos cuando sea verificada.';
        } else {
          message = 'Tu cuenta ha sido creada exitosamente.';
        }

        Alert.alert(
          title,
          message,
          [
            {
              text: 'Continuar',
              onPress: () => {
                // Redireccionar basado en el rol del usuario usando el helper
                redirectBasedOnRole(user);
              }
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
      logger.error('Error en handleRegister:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para validar matrícula (optimizado con useCallback)
  const handleValidateMatricula = useCallback(async (matricula: string) => {
    if (!matricula.trim()) return;

    setIsValidatingMatricula(true);
    try {
      const isValid = await validateMatricula(matricula);
      logger.log('🔍 Resultado de validación de matrícula:', isValid);

      if (isValid === null) {
        // Error en la validación
        Alert.alert(
          '❌ Error de Conexión',
          'No se pudo validar la matrícula. Verifica tu conexión e intenta nuevamente.',
          [{ text: 'Entendido' }]
        );
        setMatriculaValidated(null);
      } else if (isValid === false) {
        // Matrícula no encontrada
        setMatriculaValidated(false);
        setShowMatriculaConfirmation(true);
      } else {
        // Matrícula válida
        setMatriculaValidated(true);
        setShowMatriculaConfirmation(false);
      }
    } catch (error) {
      logger.error('❌ Error al validar matrícula:', error);
      Alert.alert(
        '❌ Error',
        'Ocurrió un error al validar la matrícula. Intenta nuevamente.',
        [{ text: 'Entendido' }]
      );
      setMatriculaValidated(null);
    } finally {
      setIsValidatingMatricula(false);
    }
  }, []); // No tiene dependencias externas

  // Función para manejar la confirmación de matrícula no encontrada (optimizado con useCallback)
  const handleMatriculaConfirmation = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      // El usuario confirma que la matrícula es correcta
      setMatriculaValidated(true);
      setShowMatriculaConfirmation(false);
      logger.log('✅ Usuario confirmó que la matrícula es correcta');
    } else {
      // El usuario dice que la matrícula es incorrecta
      setMatriculaValidated(null);
      setShowMatriculaConfirmation(false);
      // Enfocar el campo de matrícula para corrección
      Alert.alert(
        '📝 Corregir Matrícula',
        'Por favor, corrige tu matrícula y vuelve a validarla.',
        [{ text: 'Entendido' }]
      );
    }
  }, []); // No tiene dependencias externas

  // Debouncing para validaciones automáticas (optimización)
  const debouncedName = useDebounce(name, 400);
  const debouncedEmployeeId = useDebounce(employeeId, 400);
  const debouncedEmail = useDebounce(email, 400);
  const debouncedPassword = useDebounce(password, 400);
  const debouncedConfirmPassword = useDebounce(confirmPassword, 400);

  // Efectos para validar cuando el usuario deja de escribir
  useEffect(() => {
    if (debouncedName && errors.name) {
      validateField('name', debouncedName);
    }
  }, [debouncedName, errors.name, validateField]);

  useEffect(() => {
    if (debouncedEmployeeId && errors.employeeId) {
      validateField('employeeId', debouncedEmployeeId);
    }
  }, [debouncedEmployeeId, errors.employeeId, validateField]);

  useEffect(() => {
    if (debouncedEmail && errors.email) {
      validateField('email', debouncedEmail);
    }
  }, [debouncedEmail, errors.email, validateField]);

  useEffect(() => {
    if (debouncedPassword && errors.password) {
      validateField('password', debouncedPassword);
    }
  }, [debouncedPassword, errors.password, validateField]);

  useEffect(() => {
    if (debouncedConfirmPassword && errors.confirmPassword) {
      validateField('confirmPassword', debouncedConfirmPassword);
    }
  }, [debouncedConfirmPassword, errors.confirmPassword, validateField]);

  // Verificar si el formulario es válido (optimizado con useMemo)
  const isFormValid = useMemo(() => {
    return name.trim() !== '' &&
      employeeId.trim() !== '' &&
      email.trim() !== '' &&
      password !== '' &&
      confirmPassword !== '' &&
      matriculaValidated === true && // Matrícula debe estar validada
      acceptedPrivacy && // Debe aceptar aviso de privacidad
      acceptedLocation && // Debe autorizar uso de ubicación
      Object.values(errors).every(error => error === '');
  }, [name, employeeId, email, password, confirmPassword, matriculaValidated, acceptedPrivacy, acceptedLocation, errors]);

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
            <Text className="text-4xl font-bold text-rose-800 mb-2">
              Crear Cuenta
            </Text>
            {/* <Text className="text-3xl font-bold text-blue-600 mb-4">
              Registro
            </Text> */}
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
              className={`px-4 py-4 border rounded-lg text-base ${errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
              placeholder="Nombre completo iniciando por apellidos"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) validateField('name', text);
              }}
              onBlur={() => validateField('name', name)}
              autoCorrect={false}
              autoCapitalize='words'
              editable={!isLoading}
            />
            {errors.name ? (
              <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
            ) : null}
          </View>

          {/* Campo Matrícula */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Matrícula
            </Text>
            <View className="relative">
              <TextInput
                className={`px-4 py-4 pr-12 border rounded-lg text-base ${errors.employeeId ? 'border-red-500' :
                    matriculaValidated === true ? 'border-green-500' :
                      matriculaValidated === false ? 'border-orange-500' :
                        'border-gray-200'
                  }`}
                placeholder="Ingrese su matrícula"
                placeholderTextColor="#9CA3AF"
                value={employeeId}
                onChangeText={(text) => {
                  setEmployeeId(text);
                  // Resetear validación cuando cambia el texto
                  setMatriculaValidated(null);
                  setShowMatriculaConfirmation(false);
                  if (errors.employeeId) validateField('employeeId', text);
                }}
                onBlur={() => {
                  validateField('employeeId', employeeId);
                  // Validar matrícula automáticamente al perder el foco
                  if (employeeId.trim() && !errors.employeeId) {
                    handleValidateMatricula(employeeId);
                  }
                }}
                autoCorrect={false}
                autoCapitalize="none"
                editable={!isLoading && !isValidatingMatricula}
              />

              {/* Indicador de estado de validación */}
              <View className="absolute right-3 top-4">
                {isValidatingMatricula ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : matriculaValidated === true ? (
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                ) : matriculaValidated === false ? (
                  <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                ) : null}
              </View>
            </View>

            {/* Mensajes de estado */}
            {errors.employeeId ? (
              <Text className="text-red-500 text-xs mt-1">{errors.employeeId}</Text>
            ) : matriculaValidated === true ? (
              <Text className="text-green-600 text-xs mt-1">✅ Matrícula verificada</Text>
            ) : matriculaValidated === false ? (
              <Text className="text-orange-600 text-xs mt-1">⚠️ Matrícula no encontrada en registros</Text>
            ) : null}
          </View>

          {/* Campo Email */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Email
            </Text>
            <TextInput
              className={`px-4 py-4 border rounded-lg text-base ${errors.email ? 'border-red-500' : 'border-gray-200'
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
            <View className="relative">
              <TextInput
                className={`px-4 py-4 pr-12 border rounded-lg text-base ${errors.password ? 'border-red-500' : 'border-gray-200'
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
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-3 top-4"
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
            ) : null}
          </View>

          {/* Campo Confirmar Contraseña */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-2">
              Confirmar contraseña
            </Text>
            <View className="relative">
              <TextInput
                className={`px-4 py-4 pr-12 border rounded-lg text-base ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                  }`}
                placeholder="Confirme su contraseña"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) validateField('confirmPassword', text);
                }}
                onBlur={() => validateField('confirmPassword', confirmPassword)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                className="absolute right-3 top-4"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Checkboxes Obligatorios */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-4">
              Términos y Condiciones
            </Text>

            <View className="space-y-1">
              {/* Checkbox Aviso de Privacidad */}
              <View className="mb-4">
                <CustomCheckbox
                  checked={acceptedPrivacy}
                  onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                  disabled={isLoading}
                  title="Acepto el aviso de privacidad"
                  description="Es necesario aceptar para continuar con el registro"
                  required={true}
                />
                <Link href="https://seccion8.org/privacy" className="text-blue-600 text-xs text-left ml-8">
                  Leer aviso de privacidad
                </Link>
              </View>

              {/* Checkbox Autorización de Ubicación */}
              <View>
                <CustomCheckbox
                  checked={acceptedLocation}
                  onPress={() => setAcceptedLocation(!acceptedLocation)}
                  disabled={isLoading}
                  title="Autorizo el uso de mi ubicación geográfica para verificar asistencia"
                  description="Necesario para registrar tu asistencia en eventos"
                  required={true}
                />
              </View>
            </View>
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity
            className={`py-4 rounded-lg mb-4 ${isLoading || !isFormValid
                ? 'bg-gray-300'
                : 'bg-blue-600'
              }`}
            onPress={handleRegister}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Crear Cuenta
              </Text>
            )}
          </TouchableOpacity>

          {/* Mensaje informativo cuando el formulario no es válido */}
          {!isFormValid && !isLoading && (
            <View className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <Text className="text-gray-600 text-sm text-center mb-2">
                Para continuar, completa lo siguiente:
              </Text>
              <View className="space-y-1">
                {(!name.trim() || !employeeId.trim() || !email.trim() || !password || !confirmPassword) && (
                  <Text className="text-gray-500 text-xs text-center">
                    • Completa todos los campos obligatorios
                  </Text>
                )}
                {matriculaValidated !== true && (
                  <Text className="text-gray-500 text-xs text-center">
                    • Valida tu matrícula
                  </Text>
                )}
                {!acceptedPrivacy && (
                  <Text className="text-gray-500 text-xs text-center">
                    • Acepta el aviso de privacidad
                  </Text>
                )}
                {!acceptedLocation && (
                  <Text className="text-gray-500 text-xs text-center">
                    • Autoriza el uso de ubicación
                  </Text>
                )}
                {Object.values(errors).some(error => error !== '') && (
                  <Text className="text-gray-500 text-xs text-center">
                    • Corrige los errores en el formulario
                  </Text>
                )}
              </View>
            </View>
          )}

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
              ¿Problemas para ingresar?
            </Text>
            <Link className='text-blue-600 text-xs text-center' href="mailto:nexusolutionsmg@gmail.com?subject=Problema%20de%20ingreso">Contacte al administrador</Link>
            <Text className="text-gray-400 text-xs text-center">
              Asistencias Sección VIII Versión 1.0.0 © 2025
            </Text>
          </View>

          {/* Texto de ayuda */}
          {/* <View className="items-center mt-6">
            <Text className="text-gray-400 text-xs text-center">
              Al crear una cuenta, aceptas nuestros términos y condiciones
            </Text>
          </View> */}
        </View>
      </ScrollView>

      {/* Diálogo de confirmación de matrícula */}
      {showMatriculaConfirmation && (
        <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
          <View className="bg-white rounded-lg p-6 mx-8 max-w-sm">
            <View className="items-center mb-4">
              <Ionicons name="help-circle" size={48} color="#f59e0b" />
            </View>

            <Text className="text-lg font-bold text-gray-900 text-center mb-2">
              Matrícula No Encontrada
            </Text>

            <Text className="text-gray-600 text-center mb-6">
              No encontramos tu matrícula <Text className="font-bold">{employeeId}</Text> en nuestros registros.
            </Text>

            <Text className="text-gray-700 text-center mb-6 font-medium">
              ¿Es correcta?
            </Text>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-3 rounded-lg border border-gray-300"
                onPress={() => handleMatriculaConfirmation(false)}
                disabled={isLoading}
              >
                <Text className="text-gray-700 font-medium text-center">
                  No, corregir
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg"
                onPress={() => handleMatriculaConfirmation(true)}
                disabled={isLoading}
              >
                <Text className="text-white font-medium text-center">
                  Sí, es correcta
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-500 text-center mt-4">
              Si confirmas que es correcta, tu cuenta quedará pendiente de verificación manual.
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;