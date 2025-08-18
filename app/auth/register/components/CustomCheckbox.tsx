/* Componente personalizado de checkbox para formularios */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CustomCheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  title: string;
  description?: string;
  required?: boolean;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onPress,
  disabled = false,
  title,
  description,
  required = false
}) => {
  return (
    <TouchableOpacity
      className="flex-row items-start"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View className={`w-5 h-5 border-2 rounded mr-3 mt-0.5 items-center justify-center ${
        checked 
          ? 'bg-blue-600 border-blue-600' 
          : 'border-gray-300 bg-white'
      }`}>
        {checked && (
          <Ionicons name="checkmark" size={14} color="white" />
        )}
      </View>
      
      <View className="flex-1">
        <Text className={`text-sm leading-5 ${
          checked ? 'text-gray-900' : 'text-gray-700'
        }`}>
          {title}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
        
        {description && (
          <Text className="text-xs text-gray-500 mt-1">
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomCheckbox;
