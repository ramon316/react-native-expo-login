/* Acciones para el manejo de eventos */
import { attendancesApi } from "@/core/auth/api/attendancesApi";
import {
  CreateEventRequest,
  DeleteEventResponse,
  Event,
  UpdateEventRequest
} from "../interface/event";

/**
 * Tipos de filtros para eventos
 */
export type EventFilter = 'upcoming' | 'active' | 'past';

/**
 * Parámetros para obtener eventos
 */
export interface GetEventsParams {
  filter: EventFilter; // Obligatorio: upcoming, active, past
  limit?: number;      // Opcional: cantidad de eventos a retornar
}

/**
 * Obtiene eventos filtrados del usuario autenticado
 * @param params - Parámetros de filtrado (filter obligatorio, limit opcional)
 */
export const getEvents = async (params: GetEventsParams): Promise<Event[] | null> => {
  try {
    console.log('📋 Obteniendo eventos del usuario con filtros:', params);

    // Construir parámetros de query
    const queryParams = new URLSearchParams({
      filter: params.filter
    });

    // Agregar limit si está presente
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const { data } = await attendancesApi.get(`/events?${queryParams.toString()}`);

    console.log('📦 Respuesta completa de getEvents:', data);

    // Verificar si la respuesta tiene el formato con success y events (formato de tu API)
    if (data.success && data.events && Array.isArray(data.events)) {
      console.log('✅ Eventos obtenidos exitosamente (formato con events):', data.events.length);
      return data.events;
    }

    // Verificar si la respuesta tiene el formato con success y data
    if (data.success && data.data && Array.isArray(data.data)) {
      console.log('✅ Eventos obtenidos exitosamente (formato con data):', data.data.length);
      return data.data;
    }

    // Verificar si la respuesta es directamente un array de eventos
    if (Array.isArray(data)) {
      console.log('✅ Eventos obtenidos exitosamente (formato array directo):', data.length);
      return data;
    }

    console.log('❌ Error en la respuesta de eventos - formato no reconocido:', data);
    return null;

  } catch (error: any) {
    console.error('❌ Error al obtener eventos:', error);

    if (error.response?.data?.message) {
      console.error('📝 Mensaje del servidor:', error.response.data.message);
    }

    return null;
  }
};

/**
 * Obtiene eventos próximos (upcoming)
 * @param limit - Cantidad opcional de eventos a retornar
 */
export const getUpcomingEvents = async (limit?: number): Promise<Event[] | null> => {
  return getEvents({ filter: 'upcoming', limit });
};

/**
 * Obtiene eventos activos (active)
 * @param limit - Cantidad opcional de eventos a retornar
 */
export const getActiveEvents = async (limit?: number): Promise<Event[] | null> => {
  return getEvents({ filter: 'active', limit });
};

/**
 * Obtiene eventos pasados (past)
 * @param limit - Cantidad opcional de eventos a retornar
 */
export const getPastEvents = async (limit?: number): Promise<Event[] | null> => {
  return getEvents({ filter: 'past', limit });
};

/**
 * Obtiene todos los eventos activos (para compatibilidad con código existente)
 * Esta función mantiene la compatibilidad con el código que ya existe
 */
export const getAllEvents = async (): Promise<Event[] | null> => {
  return getEvents({ filter: 'active' });
};

/**
 * Crea un nuevo evento
 */
export const createEvent = async (eventData: CreateEventRequest): Promise<Event | null> => {
  try {
    console.log('📝 Creando nuevo evento:', eventData);

    const { data } = await attendancesApi.post('/events', eventData);

    console.log('📦 Respuesta completa de la API:', data);

    // Verificar si la respuesta tiene success y event (formato de tu API)
    if (data.success && data.event) {
      console.log('✅ Evento creado exitosamente:', data.event);
      return data.event;
    }

    // Verificar si la respuesta tiene el formato con success y data
    if (data.success && data.data) {
      console.log('✅ Evento creado exitosamente (formato con data):', data.data);
      return data.data;
    }

    // Verificar si la respuesta tiene el evento directamente
    if (data.id) {
      console.log('✅ Evento creado exitosamente (formato directo):', data);
      return data;
    }

    console.log('❌ Error al crear evento - formato de respuesta no reconocido:', data);
    return null;

  } catch (error: any) {
    console.error('❌ Error al crear evento:', error);

    if (error.response?.data?.message) {
      console.error('📝 Mensaje del servidor:', error.response.data.message);
    }

    if (error.response?.data?.errors) {
      console.error('📝 Errores de validación:', error.response.data.errors);
    }

    return null;
  }
};

/**
 * Obtiene un evento específico por ID
 */
export const getEventById = async (eventId: number): Promise<Event | null> => {
  try {
    console.log('🔍 Obteniendo evento por ID:', eventId);
    
    const { data } = await attendancesApi.get(`/events/${eventId}`);

    if (data.success && data.event) {
      console.log('✅ Evento obtenido exitosamente:', data.event);
      return data.event;
    }
    
    console.log('❌ Error al obtener evento:', data.message);
    return null;
    
  } catch (error: any) {
    console.error('❌ Error al obtener evento:', error);
    
    if (error.response?.data?.message) {
      console.error('📝 Mensaje del servidor:', error.response.data.message);
    }
    
    return null;
  }
};

/**
 * Actualiza un evento existente
 */
export const updateEvent = async (eventData: UpdateEventRequest): Promise<Event | null> => {
  try {
    console.log('✏️ Actualizando evento:', eventData);
    
    const { id, ...updateData } = eventData;
    const { data } = await attendancesApi.put(`/events/${id}`, updateData);

    if (data.success && data.event) {
      console.log('✅ Evento actualizado exitosamente:', data.event);
      return data.event;
    }
    
    console.log('❌ Error al actualizar evento:', data.message);
    return null;
    
  } catch (error: any) {
    console.error('❌ Error al actualizar evento:', error);
    
    if (error.response?.data?.message) {
      console.error('📝 Mensaje del servidor:', error.response.data.message);
    }
    
    if (error.response?.data?.errors) {
      console.error('📝 Errores de validación:', error.response.data.errors);
    }
    
    return null;
  }
};

/**
 * Elimina un evento
 */
export const deleteEvent = async (eventId: number): Promise<boolean> => {
  try {
    console.log('🗑️ Eliminando evento:', eventId);
    
    const { data } = await attendancesApi.delete<DeleteEventResponse>(`/events/${eventId}`);
    
    if (data.success) {
      console.log('✅ Evento eliminado exitosamente:', data.message);
      return true;
    }
    
    console.log('❌ Error al eliminar evento:', data.message);
    return false;
    
  } catch (error: any) {
    console.error('❌ Error al eliminar evento:', error);
    
    if (error.response?.data?.message) {
      console.error('📝 Mensaje del servidor:', error.response.data.message);
    }
    
    return false;
  }
};
