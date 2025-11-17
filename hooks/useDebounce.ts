import { useEffect, useState } from 'react';

/**
 * Hook personalizado para debouncing de valores
 * Útil para retrasar la ejecución de validaciones o búsquedas mientras el usuario escribe
 *
 * @param value - El valor que se quiere debounce
 * @param delay - Tiempo de espera en milisegundos (por defecto 300ms)
 * @returns El valor debounced
 *
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // Se ejecuta solo cuando el usuario deja de escribir por 500ms
 *   if (debouncedSearchTerm) {
 *     performSearch(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar un timer que actualizará el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia antes de que se cumpla el delay
    // Esto es crucial para el funcionamiento del debounce
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se ejecuta si value o delay cambian

  return debouncedValue;
};
