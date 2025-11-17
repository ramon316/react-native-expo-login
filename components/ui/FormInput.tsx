import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';

export interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  isLoading?: boolean;
  rightIcon?: React.ReactNode;
  showTogglePassword?: boolean;
}

/**
 * Componente de input reutilizable para formularios
 * Incluye label, mensaje de error, toggle de contraseña, etc.
 *
 * @example
 * ```tsx
 * <FormInput
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={errors.email}
 *   keyboardType="email-address"
 * />
 * ```
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  isPassword = false,
  isLoading = false,
  rightIcon,
  showTogglePassword = true,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;
  const showPasswordToggle = isPassword && showTogglePassword;

  return (
    <View className="mb-4">
      {/* Label */}
      <Text className="text-gray-700 text-sm font-medium mb-2">
        {label}
      </Text>

      {/* Input Container */}
      <View className="relative">
        <TextInput
          className={`px-4 py-4 ${showPasswordToggle || rightIcon ? 'pr-12' : ''} border rounded-lg text-base ${
            hasError ? 'border-red-500' : 'border-gray-200'
          }`}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          editable={!isLoading}
          {...textInputProps}
        />

        {/* Right Icon (Loading, Password Toggle, or Custom) */}
        {isLoading ? (
          <View className="absolute right-3 top-4">
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
        ) : showPasswordToggle ? (
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
        ) : rightIcon ? (
          <View className="absolute right-3 top-4">
            {rightIcon}
          </View>
        ) : null}
      </View>

      {/* Error Message */}
      {hasError && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
    </View>
  );
};
