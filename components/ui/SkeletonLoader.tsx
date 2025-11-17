import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Componente de skeleton loader con animación pulsante
 * Útil para mostrar placeholders mientras carga contenido
 *
 * @example
 * ```tsx
 * <SkeletonLoader width="100%" height={20} borderRadius={4} />
 * ```
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animación pulsante continua
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Skeleton loader para pantalla completa de autenticación
 */
export const AuthCheckSkeleton: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      {/* Logo placeholder */}
      <View className="items-center mb-8">
        <SkeletonLoader width={80} height={80} borderRadius={40} />
        <View className="mt-4 items-center">
          <SkeletonLoader width={200} height={24} borderRadius={4} />
          <View className="mt-2">
            <SkeletonLoader width={150} height={16} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View className="w-full max-w-xs mt-8">
        <SkeletonLoader width="100%" height={4} borderRadius={2} />
      </View>
    </View>
  );
};

/**
 * Skeleton loader para formularios
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 3 }) => {
  return (
    <View className="px-6 pt-8">
      {Array.from({ length: fields }).map((_, index) => (
        <View key={index} className="mb-4">
          <SkeletonLoader width={80} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="100%" height={48} borderRadius={8} />
        </View>
      ))}
      <View className="mt-4">
        <SkeletonLoader width="100%" height={48} borderRadius={8} />
      </View>
    </View>
  );
};
