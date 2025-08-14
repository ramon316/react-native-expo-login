/* Manejo de eventos y información respectiva */
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getEvents,
  updateEvent,
  type EventFilter
} from "@/core/event/actions/eventActions";
import { CreateEventRequest, Event, UpdateEventRequest } from "@/core/event/interface/event";
/* Zustand */
import { create } from "zustand";

/* Estados de carga para eventos */
export type EventLoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface EventState {
  // Estados
  events: Event[];
  currentEvent?: Event;
  loadingStatus: EventLoadingStatus;
  error?: string;

  // Métodos para obtener eventos
  fetchEvents: () => Promise<boolean>;
  fetchEventsByFilter: (filter: EventFilter, limit?: number) => Promise<boolean>;
  fetchUpcomingEvents: (limit?: number) => Promise<boolean>;
  fetchActiveEvents: (limit?: number) => Promise<boolean>;
  fetchPastEvents: (limit?: number) => Promise<boolean>;
  fetchEventById: (eventId: number) => Promise<boolean>;

  // Métodos para crear/actualizar eventos
  createNewEvent: (eventData: CreateEventRequest) => Promise<Event | null>;
  updateExistingEvent: (eventData: UpdateEventRequest) => Promise<Event | null>;

  // Métodos para eliminar eventos
  removeEvent: (eventId: number) => Promise<boolean>;

  // Métodos de utilidad
  clearError: () => void;
  clearCurrentEvent: () => void;
  setLoadingStatus: (status: EventLoadingStatus) => void;
}

export const useEventStore = create<EventState>()((set, get) => ({
  /* Properties */
  events: [],
  currentEvent: undefined,
  loadingStatus: 'idle',
  error: undefined,

  /* Methods o actions en Zustand */

  /**
   * Obtiene todos los eventos del usuario
   */
  fetchEvents: async () => {
    console.log('📋 useEventStore.fetchEvents iniciado');

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const events = await getAllEvents();

      if (events) {
        console.log('✅ Eventos obtenidos exitosamente:', events.length);
        set({
          events,
          loadingStatus: 'success',
          error: undefined
        });
        return true;
      } else {
        console.log('❌ No se pudieron obtener los eventos');
        set({
          events: [],
          loadingStatus: 'error',
          error: 'No se pudieron cargar los eventos'
        });
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error en fetchEvents:', error);
      set({
        events: [],
        loadingStatus: 'error',
        error: error.message || 'Error desconocido al cargar eventos'
      });
      return false;
    }
  },

  /**
   * Obtiene un evento específico por ID
   */
  fetchEventById: async (eventId: number) => {
    console.log('🔍 useEventStore.fetchEventById iniciado para ID:', eventId);

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const event = await getEventById(eventId);

      if (event) {
        console.log('✅ Evento obtenido exitosamente:', event);
        set({
          currentEvent: event,
          loadingStatus: 'success',
          error: undefined
        });
        return true;
      } else {
        console.log('❌ No se pudo obtener el evento');
        set({
          currentEvent: undefined,
          loadingStatus: 'error',
          error: 'No se pudo cargar el evento'
        });
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error en fetchEventById:', error);
      set({
        currentEvent: undefined,
        loadingStatus: 'error',
        error: error.message || 'Error desconocido al cargar el evento'
      });
      return false;
    }
  },

  /**
   * Crea un nuevo evento
   */
  createNewEvent: async (eventData: CreateEventRequest) => {
    console.log('📝 useEventStore.createNewEvent iniciado con datos:', eventData);

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const newEvent = await createEvent(eventData);

      console.log('🔍 Resultado de createEvent en store:', newEvent);

      if (newEvent) {
        console.log('✅ Evento creado exitosamente en store:', newEvent);

        // Agregar el nuevo evento a la lista existente
        const currentEvents = get().events;
        set({
          events: [newEvent, ...currentEvents],
          currentEvent: newEvent,
          loadingStatus: 'success',
          error: undefined
        });

        return newEvent;
      } else {
        console.log('❌ No se pudo crear el evento - createEvent retornó null');
        set({
          loadingStatus: 'error',
          error: 'No se pudo crear el evento - respuesta inválida del servidor'
        });
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error en createNewEvent store:', error);
      set({
        loadingStatus: 'error',
        error: error.message || 'Error desconocido al crear el evento'
      });
      return null;
    }
  },

  /**
   * Actualiza un evento existente
   */
  updateExistingEvent: async (eventData: UpdateEventRequest) => {
    console.log('✏️ useEventStore.updateExistingEvent iniciado');

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const updatedEvent = await updateEvent(eventData);

      if (updatedEvent) {
        console.log('✅ Evento actualizado exitosamente:', updatedEvent);

        // Actualizar el evento en la lista
        const currentEvents = get().events;
        const updatedEvents = currentEvents.map(event =>
          event.id === updatedEvent.id ? updatedEvent : event
        );

        set({
          events: updatedEvents,
          currentEvent: updatedEvent,
          loadingStatus: 'success',
          error: undefined
        });

        return updatedEvent;
      } else {
        console.log('❌ No se pudo actualizar el evento');
        set({
          loadingStatus: 'error',
          error: 'No se pudo actualizar el evento'
        });
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error en updateExistingEvent:', error);
      set({
        loadingStatus: 'error',
        error: error.message || 'Error desconocido al actualizar el evento'
      });
      return null;
    }
  },

  /**
   * Elimina un evento
   */
  removeEvent: async (eventId: number) => {
    console.log('🗑️ useEventStore.removeEvent iniciado para ID:', eventId);

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const success = await deleteEvent(eventId);

      if (success) {
        console.log('✅ Evento eliminado exitosamente');

        // Remover el evento de la lista
        const currentEvents = get().events;
        const filteredEvents = currentEvents.filter(event => event.id !== eventId);

        // Limpiar currentEvent si es el que se eliminó
        const currentEvent = get().currentEvent;
        const newCurrentEvent = currentEvent?.id === eventId ? undefined : currentEvent;

        set({
          events: filteredEvents,
          currentEvent: newCurrentEvent,
          loadingStatus: 'success',
          error: undefined
        });

        return true;
      } else {
        console.log('❌ No se pudo eliminar el evento');
        set({
          loadingStatus: 'error',
          error: 'No se pudo eliminar el evento'
        });
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error en removeEvent:', error);
      set({
        loadingStatus: 'error',
        error: error.message || 'Error desconocido al eliminar el evento'
      });
      return false;
    }
  },

  /**
   * Limpia el error actual
   */
  clearError: () => {
    set({ error: undefined });
  },

  /**
   * Limpia el evento actual
   */
  clearCurrentEvent: () => {
    set({ currentEvent: undefined });
  },

  /**
   * Establece el estado de carga
   */
  setLoadingStatus: (status: EventLoadingStatus) => {
    set({ loadingStatus: status });
  },

  /**
   * Obtiene eventos por filtro específico
   */
  fetchEventsByFilter: async (filter: EventFilter, limit?: number): Promise<boolean> => {
    console.log(`📋 Obteniendo eventos con filtro: ${filter}, limit: ${limit}`);

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const events = await getEvents({ filter, limit });

      if (events) {
        console.log(`✅ Eventos ${filter} obtenidos exitosamente:`, events.length);
        set({
          events,
          loadingStatus: 'success',
          error: undefined
        });
        return true;
      } else {
        console.log(`❌ No se pudieron obtener eventos ${filter}`);
        set({
          loadingStatus: 'error',
          error: `No se pudieron obtener los eventos ${filter}`
        });
        return false;
      }
    } catch (error) {
      console.error(`❌ Error al obtener eventos ${filter}:`, error);
      set({
        loadingStatus: 'error',
        error: `Error al obtener eventos ${filter}`
      });
      return false;
    }
  },

  /**
   * Obtiene eventos próximos
   */
  fetchUpcomingEvents: async (limit?: number): Promise<boolean> => {
    return get().fetchEventsByFilter('upcoming', limit);
  },

  /**
   * Obtiene eventos activos
   */
  fetchActiveEvents: async (limit?: number): Promise<boolean> => {
    return get().fetchEventsByFilter('active', limit);
  },

  /**
   * Obtiene eventos pasados
   */
  fetchPastEvents: async (limit?: number): Promise<boolean> => {
    return get().fetchEventsByFilter('past', limit);
  },
}));