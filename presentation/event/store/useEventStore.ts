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

// Logger condicional basado en el entorno
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';
const logger = {
    log: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        if (STAGE === 'dev') {
            console.error(...args);
        }
        // En producción, aquí podrías enviar errores críticos a un servicio de monitoreo
    }
};

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
    logger.log('📋 useEventStore.fetchEvents iniciado');

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const events = await getAllEvents();

      if (events) {
        logger.log('✅ Eventos obtenidos exitosamente:', events.length);
        set({
          events,
          loadingStatus: 'success',
          error: undefined
        });
        return true;
      } else {
        logger.log('❌ No se pudieron obtener los eventos');
        set({
          events: [],
          loadingStatus: 'error',
          error: 'No se pudieron cargar los eventos'
        });
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Error en fetchEvents:', error);
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
    logger.log('🔍 useEventStore.fetchEventById iniciado para ID:', eventId);

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const event = await getEventById(eventId);

      if (event) {
        logger.log('✅ Evento obtenido exitosamente:', event);
        set({
          currentEvent: event,
          loadingStatus: 'success',
          error: undefined
        });
        return true;
      } else {
        logger.log('❌ No se pudo obtener el evento');
        set({
          currentEvent: undefined,
          loadingStatus: 'error',
          error: 'No se pudo cargar el evento'
        });
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Error en fetchEventById:', error);
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
    logger.log('📝 useEventStore.createNewEvent iniciado con datos:', eventData);

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const newEvent = await createEvent(eventData);

      logger.log('🔍 Resultado de createEvent en store:', newEvent);

      if (newEvent) {
        logger.log('✅ Evento creado exitosamente en store:', newEvent);

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
        logger.log('❌ No se pudo crear el evento - createEvent retornó null');
        set({
          loadingStatus: 'error',
          error: 'No se pudo crear el evento - respuesta inválida del servidor'
        });
        return null;
      }
    } catch (error: any) {
      logger.error('❌ Error en createNewEvent store:', error);
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
    logger.log('✏️ useEventStore.updateExistingEvent iniciado');

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const updatedEvent = await updateEvent(eventData);

      if (updatedEvent) {
        logger.log('✅ Evento actualizado exitosamente:', updatedEvent);

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
        logger.log('❌ No se pudo actualizar el evento');
        set({
          loadingStatus: 'error',
          error: 'No se pudo actualizar el evento'
        });
        return null;
      }
    } catch (error: any) {
      logger.error('❌ Error en updateExistingEvent:', error);
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
    logger.log('🗑️ useEventStore.removeEvent iniciado para ID:', eventId);

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const success = await deleteEvent(eventId);

      if (success) {
        logger.log('✅ Evento eliminado exitosamente');

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
        logger.log('❌ No se pudo eliminar el evento');
        set({
          loadingStatus: 'error',
          error: 'No se pudo eliminar el evento'
        });
        return false;
      }
    } catch (error: any) {
      logger.error('❌ Error en removeEvent:', error);
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
    logger.log(`📋 Obteniendo eventos con filtro: ${filter}, limit: ${limit}`);

    set({ loadingStatus: 'loading', error: undefined });

    try {
      const events = await getEvents({ filter, limit });

      if (events) {
        logger.log(`✅ Eventos ${filter} obtenidos exitosamente:`, events.length);
        set({
          events,
          loadingStatus: 'success',
          error: undefined
        });
        return true;
      } else {
        logger.log(`❌ No se pudieron obtener eventos ${filter}`);
        set({
          loadingStatus: 'error',
          error: `No se pudieron obtener los eventos ${filter}`
        });
        return false;
      }
    } catch (error) {
      logger.error(`❌ Error al obtener eventos ${filter}:`, error);
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