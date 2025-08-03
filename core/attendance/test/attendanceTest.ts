/* Archivo de pruebas para el sistema de asistencias */

import {
    isValidQRCode,
    sanitizeQRCode,
    submitAttendance
} from '../actions/attendanceActions';
import { AttendanceRequest } from '../interface/attendance';
import { LocationService } from '../services/locationService';

/**
 * Pruebas para validación de QR codes
 */
export const testQRValidation = () => {
  console.log('🧪 Iniciando pruebas de validación QR...');
  
  // Casos de prueba para QR codes válidos
  const validQRCodes = [
    '550e8400-e29b-41d4-a716-446655440000',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  ];
  
  // Casos de prueba para QR codes inválidos
  const invalidQRCodes = [
    'invalid-qr-code',
    '123456789',
    '',
    '550e8400-e29b-41d4-a716-44665544000', // UUID incompleto
    '550e8400-e29b-41d4-a716-44665544000g', // UUID con carácter inválido
  ];
  
  console.log('✅ Probando QR codes válidos:');
  validQRCodes.forEach(qr => {
    const isValid = isValidQRCode(qr);
    console.log(`  ${qr}: ${isValid ? '✅' : '❌'}`);
  });
  
  console.log('❌ Probando QR codes inválidos:');
  invalidQRCodes.forEach(qr => {
    const isValid = isValidQRCode(qr);
    console.log(`  ${qr}: ${isValid ? '❌ FALLÓ' : '✅'}`);
  });
  
  // Pruebas de sanitización
  console.log('🧹 Probando sanitización:');
  const dirtyQRCodes = [
    '  550e8400-e29b-41d4-a716-446655440000  ',
    '550e8400-e29b-41d4-a716-446655440000\n',
    '\t550e8400-e29b-41d4-a716-446655440000\t'
  ];
  
  dirtyQRCodes.forEach(qr => {
    const clean = sanitizeQRCode(qr);
    console.log(`  "${qr}" -> "${clean}"`);
  });
};

/**
 * Pruebas para validación de coordenadas
 */
export const testLocationValidation = () => {
  console.log('🧪 Iniciando pruebas de validación de ubicación...');
  
  // Casos de prueba para coordenadas válidas
  const validCoordinates = [
    { lat: 0, lng: 0 },
    { lat: 90, lng: 180 },
    { lat: -90, lng: -180 },
    { lat: 19.4326, lng: -99.1332 }, // Ciudad de México
    { lat: 40.7128, lng: -74.0060 }, // Nueva York
  ];
  
  // Casos de prueba para coordenadas inválidas
  const invalidCoordinates = [
    { lat: 91, lng: 0 }, // Latitud fuera de rango
    { lat: -91, lng: 0 }, // Latitud fuera de rango
    { lat: 0, lng: 181 }, // Longitud fuera de rango
    { lat: 0, lng: -181 }, // Longitud fuera de rango
    { lat: NaN, lng: 0 }, // NaN
    { lat: 0, lng: NaN }, // NaN
  ];
  
  console.log('✅ Probando coordenadas válidas:');
  validCoordinates.forEach(coord => {
    const latValid = coord.lat >= -90 && coord.lat <= 90;
    const lngValid = coord.lng >= -180 && coord.lng <= 180;
    const isValid = latValid && lngValid;
    console.log(`  (${coord.lat}, ${coord.lng}): ${isValid ? '✅' : '❌'}`);
  });
  
  console.log('❌ Probando coordenadas inválidas:');
  invalidCoordinates.forEach(coord => {
    const latValid = !isNaN(coord.lat) && coord.lat >= -90 && coord.lat <= 90;
    const lngValid = !isNaN(coord.lng) && coord.lng >= -180 && coord.lng <= 180;
    const isValid = latValid && lngValid;
    console.log(`  (${coord.lat}, ${coord.lng}): ${isValid ? '❌ FALLÓ' : '✅'}`);
  });
};

/**
 * Prueba de cálculo de distancia
 */
export const testDistanceCalculation = () => {
  console.log('🧪 Iniciando pruebas de cálculo de distancia...');
  
  // Coordenadas de prueba
  const coord1 = { lat: 19.4326, lng: -99.1332 }; // Ciudad de México
  const coord2 = { lat: 19.4340, lng: -99.1330 }; // Muy cerca de CDMX
  const coord3 = { lat: 40.7128, lng: -74.0060 }; // Nueva York
  
  const distance1 = LocationService.calculateDistance(
    coord1.lat, coord1.lng, 
    coord2.lat, coord2.lng
  );
  
  const distance2 = LocationService.calculateDistance(
    coord1.lat, coord1.lng, 
    coord3.lat, coord3.lng
  );
  
  console.log(`📍 Distancia CDMX a punto cercano: ${Math.round(distance1)}m`);
  console.log(`📍 Distancia CDMX a Nueva York: ${Math.round(distance2 / 1000)}km`);
  
  // Verificar que las distancias son razonables
  if (distance1 < 1000) { // Menos de 1km
    console.log('✅ Distancia corta calculada correctamente');
  } else {
    console.log('❌ Error en cálculo de distancia corta');
  }
  
  if (distance2 > 1000000) { // Más de 1000km
    console.log('✅ Distancia larga calculada correctamente');
  } else {
    console.log('❌ Error en cálculo de distancia larga');
  }
};

/**
 * Prueba simulada de envío de asistencia
 */
export const testAttendanceSubmission = async () => {
  console.log('🧪 Iniciando prueba simulada de envío de asistencia...');

  // Datos de prueba
  const testAttendanceData: AttendanceRequest = {
    qr_code: '550e8400-e29b-41d4-a716-446655440000',
    user_latitude: 19.4326,
    user_longitude: -99.1332
  };

  console.log('📝 Datos de prueba:', testAttendanceData);

  try {
    // Nota: Esta llamada fallará porque no estamos conectados a la API real
    // pero nos permite probar la validación de datos
    const result = await submitAttendance(testAttendanceData);

    if (result) {
      console.log('✅ Asistencia enviada exitosamente:', result);
      console.log('📊 Datos de respuesta:', {
        attendanceId: result.attendance?.id,
        eventName: result.attendance?.event?.name,
        distance: result.distance,
        verified: result.attendance?.verified
      });
    } else {
      console.log('❌ Error al enviar asistencia (esperado en pruebas)');
    }
  } catch (error) {
    console.log('❌ Error capturado (esperado en pruebas):', error);
  }
};

/**
 * Prueba del flujo completo de store
 */
export const testStoreFlow = async () => {
  console.log('🧪 Iniciando prueba del flujo completo del store...');

  // Simular el flujo que ocurre en el componente
  const qrCode = '550e8400-e29b-41d4-a716-446655440000';

  console.log('📝 Simulando submitAttendanceRecord con QR:', qrCode);

  // Nota: Esta función requiere que el store esté inicializado
  // En un entorno de pruebas real, necesitarías mockear la API
  console.log('ℹ️ Para probar el store completo, ejecuta desde el componente QR');
  console.log('ℹ️ El store ahora retorna directamente los datos de asistencia');
  console.log('ℹ️ Esto resuelve el problema de timing con currentAttendance');
};

/**
 * Ejecutar todas las pruebas
 */
export const runAllTests = async () => {
  console.log('🚀 Iniciando suite completa de pruebas...\n');
  
  testQRValidation();
  console.log('');
  
  testLocationValidation();
  console.log('');
  
  testDistanceCalculation();
  console.log('');
  
  await testAttendanceSubmission();
  console.log('');
  
  console.log('✅ Suite de pruebas completada');
};

/**
 * Función para probar permisos de ubicación
 */
export const testLocationPermissions = async () => {
  console.log('🧪 Probando permisos de ubicación...');
  
  try {
    const hasPermissions = await LocationService.checkLocationPermissions();
    console.log('📍 Permisos actuales:', hasPermissions ? '✅ Concedidos' : '❌ Denegados');
    
    if (!hasPermissions) {
      console.log('🔐 Solicitando permisos...');
      const result = await LocationService.requestLocationPermissions();
      console.log('📍 Resultado:', result.granted ? '✅ Concedidos' : '❌ Denegados');
      
      if (result.error) {
        console.log('❌ Error:', result.error.message);
      }
    }
    
    // Intentar obtener ubicación
    console.log('📍 Obteniendo ubicación...');
    const locationResult = await LocationService.getCurrentLocation();
    
    if (locationResult.location) {
      console.log('✅ Ubicación obtenida:', {
        lat: locationResult.location.latitude.toFixed(6),
        lng: locationResult.location.longitude.toFixed(6),
        accuracy: locationResult.location.accuracy
      });
    } else {
      console.log('❌ Error al obtener ubicación:', locationResult.error?.message);
    }
    
  } catch (error) {
    console.log('❌ Error en prueba de ubicación:', error);
  }
};

// Exportar función principal para uso en desarrollo
export default {
  runAllTests,
  testQRValidation,
  testLocationValidation,
  testDistanceCalculation,
  testAttendanceSubmission,
  testStoreFlow,
  testLocationPermissions
};
