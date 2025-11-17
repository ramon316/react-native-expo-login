import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Tipo para reglas de validación
 * Cada campo tiene una función que retorna un string de error o vacío
 */
export type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], allValues?: T) => string;
};

/**
 * Opciones para configurar el hook
 */
export interface UseFormValidationOptions {
  /**
   * Tiempo de debounce para validaciones automáticas (en ms)
   * @default 400
   */
  debounceTime?: number;

  /**
   * Si true, valida campos automáticamente mientras el usuario escribe (después del debounce)
   * @default false
   */
  validateOnChange?: boolean;

  /**
   * Si true, valida campos cuando pierden el foco
   * @default true
   */
  validateOnBlur?: boolean;
}

/**
 * Hook personalizado para manejo de formularios con validación
 * Incluye debouncing automático, validación en tiempo real y gestión de errores
 *
 * @template T - Tipo del objeto de valores del formulario
 * @param initialValues - Valores iniciales del formulario
 * @param validationRules - Reglas de validación para cada campo
 * @param options - Opciones de configuración
 *
 * @example
 * ```typescript
 * const { values, errors, touched, handleChange, handleBlur, isValid, reset } = useFormValidation(
 *   { email: '', password: '' },
 *   {
 *     email: (value) => !value ? 'Email requerido' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : '',
 *     password: (value) => !value ? 'Contraseña requerida' : value.length < 8 ? 'Mínimo 8 caracteres' : ''
 *   }
 * );
 * ```
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>,
  options: UseFormValidationOptions = {}
) => {
  const {
    debounceTime = 400,
    validateOnChange = false,
    validateOnBlur = true
  } = options;

  // Estados
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({} as any);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({} as any);

  // Debounced values para cada campo
  const debouncedValues = Object.keys(values).reduce((acc, key) => {
    acc[key as keyof T] = useDebounce(values[key as keyof T], debounceTime);
    return acc;
  }, {} as T);

  /**
   * Valida un campo específico
   */
  const validateField = useCallback(
    (field: keyof T, value: any): string => {
      const rule = validationRules[field];
      if (!rule) return '';

      const error = rule(value, values);
      return error;
    },
    [validationRules, values]
  );

  /**
   * Valida todos los campos del formulario
   */
  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {} as any;
    let isValid = true;

    (Object.keys(values) as Array<keyof T>).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  /**
   * Maneja el cambio de un campo
   */
  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Solo validar inmediatamente si validateOnChange está activado Y el campo ya fue touched
      if (validateOnChange && touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validateOnChange, touched, validateField]
  );

  /**
   * Maneja cuando un campo pierde el foco
   */
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (validateOnBlur) {
        const error = validateField(field, values[field]);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [validateOnBlur, validateField, values]
  );

  /**
   * Resetea el formulario a los valores iniciales
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as any);
    setTouched({} as any);
  }, [initialValues]);

  /**
   * Establece un error manualmente
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Establece un valor manualmente
   */
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Establece múltiples valores
   */
  const setFieldsValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Validación automática con debounce para campos touched
  useEffect(() => {
    if (!validateOnChange) return;

    (Object.keys(debouncedValues) as Array<keyof T>).forEach((field) => {
      if (touched[field] && errors[field]) {
        const error = validateField(field, debouncedValues[field]);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    });
  }, [debouncedValues, touched, errors, validateField, validateOnChange]);

  // Verificar si el formulario es válido (memoizado)
  const isValid = useMemo(() => {
    // Verificar que todos los campos tengan valor
    const allFieldsFilled = (Object.keys(values) as Array<keyof T>).every(
      (field) => {
        const value = values[field];
        // Verificar que no sea vacío (string, array, etc.)
        if (typeof value === 'string') return value.trim() !== '';
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return true; // Booleanos siempre son válidos
        return value != null && value !== '';
      }
    );

    // Verificar que no haya errores
    const noErrors = Object.values(errors).every((error) => !error);

    return allFieldsFilled && noErrors;
  }, [values, errors]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    isValid,
    reset,
    setFieldError,
    setFieldValue,
    setFieldsValues,
  };
};
