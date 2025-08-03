# Sistema de Asistencias con QR y Geolocalización

Este módulo implementa un sistema completo de registro de asistencias que utiliza códigos QR y geolocalización para verificar la presencia de usuarios en eventos.

## 🚀 Características

- **Escaneo de QR**: Lectura de códigos QR únicos para cada evento
- **Geolocalización**: Captura automática de la ubicación del usuario
- **Validación**: Verificación de códigos QR y coordenadas geográficas
- **API Integration**: Envío seguro de datos al backend Laravel
- **Estado Management**: Gestión de estado con Zustand
- **UI/UX**: Interfaz intuitiva con feedback visual
- **Manejo de Errores**: Gestión robusta de errores y casos edge

## 📁 Estructura del Módulo

```
core/attendance/
├── interface/
│   └── attendance.ts          # Interfaces TypeScript
├── services/
│   └── locationService.ts     # Servicio de geolocalización
├── actions/
│   └── attendanceActions.ts   # Acciones de API
├── test/
│   └── attendanceTest.ts      # Pruebas del sistema
└── README.md                  # Este archivo

presentation/attendance/
└── store/
    └── useAttendanceStore.ts  # Store Zustand
```

## 🔧 Configuración

### 1. Dependencias Requeridas

Asegúrate de tener instaladas las siguientes dependencias:

```bash
# Expo dependencies
expo install expo-camera expo-location

# State management
npm install zustand

# HTTP client (ya configurado)
npm install axios
```

### 2. Permisos

El sistema requiere los siguientes permisos en `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Permite a la aplicación acceder a la cámara para escanear códigos QR."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Permite a la aplicación acceder a tu ubicación para verificar tu asistencia."
        }
      ]
    ]
  }
}
```

## 📱 Uso

### 1. Importar el Store

```typescript
import { useAttendanceStore } from '@/presentation/attendance/store/useAttendanceStore';
```

### 2. Usar en Componente

```typescript
const MyComponent = () => {
  const {
    status,
    error,
    userLocation,
    currentAttendance,
    requestLocationPermission,
    getCurrentLocation,
    submitAttendanceRecord,
    clearError,
    resetAttendanceFlow
  } = useAttendanceStore();

  // Tu lógica aquí
};
```

### 3. Flujo Básico

1. **Solicitar Permisos**: Cámara y ubicación
2. **Obtener Ubicación**: GPS del usuario
3. **Escanear QR**: Código del evento
4. **Validar Datos**: QR y coordenadas
5. **Enviar API**: Registro de asistencia
6. **Mostrar Resultado**: Éxito o error

## 🔍 API Endpoints

### POST /attendances

Registra la asistencia de un usuario.

**Request:**
```json
{
  "qr_code": "550e8400-e29b-41d4-a716-446655440000",
  "user_latitude": 19.4326,
  "user_longitude": -99.1332
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Asistencia registrada exitosamente",
  "attendance": {
    "id": 123,
    "event_id": 456,
    "user_id": 789,
    "user_latitude": 19.4326,
    "user_longitude": -99.1332,
    "distance_meters": 25.5,
    "verified": true,
    "checked_in_at": "2025-08-03T14:30:21.000000Z",
    "event": { /* datos del evento */ },
    "user": { /* datos del usuario */ }
  },
  "distance": 25.5
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": {
    "qr_code": ["El código QR no existe o es inválido"],
    "user_latitude": ["La latitud debe estar entre -90 y 90"],
    "user_longitude": ["La longitud debe estar entre -180 y 180"]
  }
}
```

## 🧪 Testing

Para ejecutar las pruebas del sistema:

```typescript
import attendanceTest from '@/core/attendance/test/attendanceTest';

// Ejecutar todas las pruebas
await attendanceTest.runAllTests();

// Ejecutar pruebas específicas
attendanceTest.testQRValidation();
attendanceTest.testLocationValidation();
await attendanceTest.testLocationPermissions();
```

## 🔧 Configuración Avanzada

### Precisión de Ubicación

Puedes configurar diferentes niveles de precisión:

```typescript
import { LocationService, LOCATION_CONFIGS } from '@/core/attendance/services/locationService';

// Alta precisión (más lento, más preciso)
const location = await LocationService.getCurrentLocation(LOCATION_CONFIGS.high);

// Precisión balanceada (recomendado)
const location = await LocationService.getCurrentLocation(LOCATION_CONFIGS.balanced);

// Baja precisión (más rápido, menos preciso)
const location = await LocationService.getCurrentLocation(LOCATION_CONFIGS.low);
```

### Validación Personalizada

```typescript
import { isValidQRCode, sanitizeQRCode } from '@/core/attendance/actions/attendanceActions';

// Validar formato UUID v4
const isValid = isValidQRCode('550e8400-e29b-41d4-a716-446655440000');

// Limpiar código QR
const cleanCode = sanitizeQRCode('  550e8400-e29b-41d4-a716-446655440000  ');
```

## 🚨 Manejo de Errores

El sistema maneja diferentes tipos de errores:

- **`permission`**: Permisos denegados
- **`location`**: Error al obtener ubicación
- **`qr`**: Código QR inválido
- **`network`**: Error de conexión
- **`validation`**: Error de validación del servidor

```typescript
const { error } = useAttendanceStore();

if (error) {
  switch (error.type) {
    case 'permission':
      // Mostrar diálogo de permisos
      break;
    case 'location':
      // Reintentar obtener ubicación
      break;
    case 'network':
      // Verificar conexión
      break;
    // ... otros casos
  }
}
```

## 📊 Estados del Sistema

- **`idle`**: Estado inicial
- **`requesting-location`**: Solicitando permisos de ubicación
- **`scanning`**: Escaneando código QR
- **`submitting`**: Enviando datos a la API
- **`success`**: Registro exitoso
- **`error`**: Error en el proceso

## 🔒 Seguridad

- Validación de datos en cliente y servidor
- Tokens de autenticación en headers
- Sanitización de códigos QR
- Verificación de rangos de coordenadas
- Manejo seguro de errores sin exponer información sensible

## 🎯 Próximas Mejoras

- [ ] Cache de ubicaciones para mejor rendimiento
- [ ] Modo offline con sincronización posterior
- [ ] Historial de asistencias con paginación
- [ ] Estadísticas de asistencia del usuario
- [ ] Notificaciones push para confirmaciones
- [ ] Soporte para múltiples formatos de QR

## 📞 Soporte

Para reportar bugs o solicitar nuevas características, contacta al equipo de desarrollo.
