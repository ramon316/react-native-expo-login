# Sistema de Visualización de Asistencias del Usuario

Este módulo implementa un sistema completo para que los usuarios puedan visualizar y gestionar su historial de asistencias a eventos.

## 🚀 Características

- **Historial Completo**: Visualización de todas las asistencias del usuario
- **Búsqueda y Filtros**: Búsqueda por nombre de evento y filtros por estado
- **Estadísticas**: Métricas de asistencia, eventos y distancias
- **Agrupaciones**: Vista por eventos o por fechas
- **Estado en Tiempo Real**: Actualización automática de datos
- **UI Responsiva**: Interfaz optimizada para móviles

## 📁 Estructura del Módulo

```
core/user-attendance/
├── interface/
│   └── userAttendance.ts          # Interfaces TypeScript
├── actions/
│   └── userAttendanceActions.ts   # Acciones de API
└── README.md                      # Este archivo

presentation/user-attendance/
└── store/
    └── useUserAttendanceStore.ts  # Store Zustand

app/(attendances-app)/(home)/
└── index.tsx                      # Vista principal
```

## 🔧 API Endpoint

### GET /attendances/my

Obtiene las asistencias del usuario autenticado.

**Response:**
```json
{
  "success": true,
  "message": "Attendances retrieved successfully",
  "attendances": [
    {
      "id": 8,
      "event_id": 7,
      "user_id": 2,
      "user_latitude": "28.64178130",
      "user_longitude": "-106.08258460",
      "distance_meters": "2.52",
      "verified": true,
      "checked_in_at": "2025-08-13T18:49:31.000000Z",
      "created_at": "2025-08-13T18:49:31.000000Z",
      "updated_at": "2025-08-13T18:49:31.000000Z",
      "event": {
        "id": 7,
        "name": "Reunión Informativa Agosto Sindicato",
        "description": "Reunión para mencionar los avances...",
        "latitude": "28.64180300",
        "longitude": "-106.08257700",
        "address": "Av. Independencia #715 Col. El Palomar",
        "allowed_radius": 100,
        "start_time": "2025-08-13T16:00:00.000000Z",
        "end_time": "2025-08-15T22:00:00.000000Z",
        "active": true,
        "user_id": 4,
        "qr_code": "f1a6a7a6-1baf-4aad-9d0a-e42166b3667b",
        "created_at": "2025-08-13T15:33:37.000000Z",
        "updated_at": "2025-08-13T15:33:37.000000Z"
      }
    }
  ]
}
```

## 📱 Uso del Store

### Importar el Store

```typescript
import { useUserAttendanceStore } from '@/presentation/user-attendance/store/useUserAttendanceStore';
```

### Usar en Componente

```typescript
const MyComponent = () => {
  const {
    attendances,
    filteredAttendances,
    loadingStatus,
    stats,
    fetchMyAttendances,
    setSearchTerm,
    setFilters
  } = useUserAttendanceStore();

  useEffect(() => {
    fetchMyAttendances();
  }, []);

  // Tu lógica aquí
};
```

## 🔍 Funcionalidades Principales

### 1. Cargar Asistencias

```typescript
// Cargar todas las asistencias
await fetchMyAttendances();

// Cargar con parámetros
await fetchMyAttendances({
  page: 1,
  limit: 20,
  filters: {
    verified: true,
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  }
});
```

### 2. Búsqueda y Filtros

```typescript
// Búsqueda por nombre de evento
setSearchTerm('Reunión');

// Filtrar solo asistencias verificadas
setFilters({ verified: true });

// Limpiar filtros
clearFilters();
```

### 3. Estadísticas

```typescript
// Cargar estadísticas
await fetchMyAttendanceStats();

// Acceder a estadísticas
console.log(stats?.total_attendances);
console.log(stats?.verified_attendances);
console.log(stats?.events_attended);
console.log(stats?.average_distance);
```

### 4. Agrupaciones

```typescript
// Agrupar por evento
groupByEvent();
console.log(attendancesByEvent);

// Agrupar por fecha
groupByDate();
console.log(attendancesByDate);
```

## 🎨 Componentes de UI

### Estados Manejados

- **Loading**: Spinner durante la carga
- **Error**: Mensaje de error con botón de reintento
- **Empty**: Mensaje cuando no hay asistencias
- **Success**: Lista de asistencias con datos

### Características de la UI

- **Header con estadísticas**: Total, verificadas, eventos, distancia promedio
- **Barra de búsqueda**: Búsqueda en tiempo real
- **Filtros expandibles**: Filtro por estado de verificación
- **Cards de asistencias**: Información detallada de cada registro
- **Pull-to-refresh**: Actualización manual de datos
- **Botón QR**: Acceso rápido al escáner

### Información Mostrada por Asistencia

- **Nombre del evento**
- **Descripción del evento**
- **Estado de verificación** (Verificada/Pendiente)
- **Fecha y hora de registro**
- **Distancia desde el evento**
- **Dirección del evento**

## 🔧 Funciones Utilitarias

### Formateo de Datos

```typescript
// Formatear fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formatear distancia
const formatDistance = (distance: string) => {
  const dist = parseFloat(distance);
  return dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`;
};
```

### Agrupaciones Personalizadas

```typescript
import { 
  groupAttendancesByEvent, 
  groupAttendancesByDate,
  calculateAttendanceStats 
} from '@/core/user-attendance/actions/userAttendanceActions';

// Agrupar asistencias por evento
const byEvent = groupAttendancesByEvent(attendances);

// Agrupar asistencias por fecha
const byDate = groupAttendancesByDate(attendances);

// Calcular estadísticas personalizadas
const customStats = calculateAttendanceStats(filteredAttendances);
```

## 📊 Tipos de Datos

### UserAttendance

```typescript
interface UserAttendance {
  id: number;
  event_id: number;
  user_id: number;
  user_latitude: string;
  user_longitude: string;
  distance_meters: string;
  verified: boolean;
  checked_in_at: string;
  created_at: string;
  updated_at: string;
  event: Event;
}
```

### UserAttendanceStats

```typescript
interface UserAttendanceStats {
  total_attendances: number;
  verified_attendances: number;
  unverified_attendances: number;
  events_attended: number;
  average_distance: number;
  recent_attendances: UserAttendance[];
}
```

## 🚨 Manejo de Errores

El sistema maneja diferentes tipos de errores:

- **401**: Token de autenticación inválido
- **404**: Endpoint no encontrado
- **Network**: Errores de conexión
- **Parsing**: Errores de formato de datos

## 🔄 Estados de Carga

- **`idle`**: Estado inicial
- **`loading`**: Cargando datos
- **`success`**: Datos cargados exitosamente
- **`error`**: Error al cargar datos

## 🎯 Próximas Mejoras

- [ ] Exportar asistencias a PDF/Excel
- [ ] Notificaciones de nuevas asistencias
- [ ] Vista de mapa con ubicaciones
- [ ] Comparativas mensuales/anuales
- [ ] Sincronización offline
- [ ] Filtros avanzados por fecha y ubicación

## 📞 Soporte

Para reportar bugs o solicitar nuevas características, contacta al equipo de desarrollo.
