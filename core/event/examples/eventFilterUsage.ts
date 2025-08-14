/* Ejemplos de uso de los nuevos filtros de eventos */

import { useEventStore } from '@/presentation/event/store/useEventStore';
import { 
  getEvents, 
  getActiveEvents, 
  getUpcomingEvents, 
  getPastEvents,
  type EventFilter 
} from '@/core/event/actions/eventActions';

/**
 * Ejemplos de uso directo de las funciones de API
 */
export const directApiUsage = {
  
  /**
   * Obtener eventos activos (start_date <= now && end_date >= now)
   */
  async getActiveEvents() {
    console.log('📋 Obteniendo eventos activos...');
    const events = await getActiveEvents();
    console.log('✅ Eventos activos:', events?.length || 0);
    return events;
  },

  /**
   * Obtener próximos eventos (start_date > now)
   */
  async getUpcomingEvents() {
    console.log('📋 Obteniendo eventos próximos...');
    const events = await getUpcomingEvents();
    console.log('✅ Eventos próximos:', events?.length || 0);
    return events;
  },

  /**
   * Obtener eventos pasados (end_date < now)
   */
  async getPastEvents() {
    console.log('📋 Obteniendo eventos pasados...');
    const events = await getPastEvents();
    console.log('✅ Eventos pasados:', events?.length || 0);
    return events;
  },

  /**
   * Obtener eventos con límite
   */
  async getEventsWithLimit() {
    console.log('📋 Obteniendo últimos 5 eventos activos...');
    const events = await getActiveEvents(5);
    console.log('✅ Últimos 5 eventos activos:', events?.length || 0);
    return events;
  },

  /**
   * Obtener eventos con filtro personalizado
   */
  async getEventsWithCustomFilter(filter: EventFilter, limit?: number) {
    console.log(`📋 Obteniendo eventos con filtro: ${filter}, límite: ${limit}`);
    const events = await getEvents({ filter, limit });
    console.log(`✅ Eventos ${filter}:`, events?.length || 0);
    return events;
  }
};

/**
 * Ejemplos de uso con el store de Zustand
 */
export const storeUsage = {

  /**
   * Componente que muestra eventos activos
   */
  useActiveEventsComponent() {
    const { 
      events, 
      loadingStatus, 
      error, 
      fetchActiveEvents 
    } = useEventStore();

    // Función para cargar eventos activos
    const loadActiveEvents = async () => {
      const success = await fetchActiveEvents();
      if (success) {
        console.log('✅ Eventos activos cargados en el store');
      } else {
        console.log('❌ Error al cargar eventos activos');
      }
    };

    return {
      events,
      loadingStatus,
      error,
      loadActiveEvents
    };
  },

  /**
   * Componente que muestra próximos eventos con límite
   */
  useUpcomingEventsComponent() {
    const { 
      events, 
      loadingStatus, 
      error, 
      fetchUpcomingEvents 
    } = useEventStore();

    // Función para cargar próximos 10 eventos
    const loadUpcomingEvents = async () => {
      const success = await fetchUpcomingEvents(10);
      if (success) {
        console.log('✅ Próximos eventos cargados en el store');
      } else {
        console.log('❌ Error al cargar próximos eventos');
      }
    };

    return {
      events,
      loadingStatus,
      error,
      loadUpcomingEvents
    };
  },

  /**
   * Componente que permite filtrar eventos dinámicamente
   */
  useDynamicEventFilter() {
    const { 
      events, 
      loadingStatus, 
      error, 
      fetchEventsByFilter 
    } = useEventStore();

    // Función para filtrar eventos dinámicamente
    const filterEvents = async (filter: EventFilter, limit?: number) => {
      const success = await fetchEventsByFilter(filter, limit);
      if (success) {
        console.log(`✅ Eventos ${filter} cargados en el store`);
      } else {
        console.log(`❌ Error al cargar eventos ${filter}`);
      }
    };

    return {
      events,
      loadingStatus,
      error,
      filterEvents
    };
  }
};

/**
 * Ejemplos de uso en componentes React Native
 */
export const componentExamples = {

  /**
   * Ejemplo de componente que muestra diferentes tipos de eventos
   */
  eventDashboardExample: `
    import React, { useEffect, useState } from 'react';
    import { View, Text, TouchableOpacity } from 'react-native';
    import { useEventStore } from '@/presentation/event/store/useEventStore';

    const EventDashboard = () => {
      const { 
        events, 
        loadingStatus, 
        fetchActiveEvents, 
        fetchUpcomingEvents, 
        fetchPastEvents 
      } = useEventStore();
      
      const [currentFilter, setCurrentFilter] = useState<'active' | 'upcoming' | 'past'>('active');

      useEffect(() => {
        // Cargar eventos activos por defecto
        fetchActiveEvents();
      }, []);

      const handleFilterChange = (filter: 'active' | 'upcoming' | 'past') => {
        setCurrentFilter(filter);
        switch (filter) {
          case 'active':
            fetchActiveEvents(20);
            break;
          case 'upcoming':
            fetchUpcomingEvents(20);
            break;
          case 'past':
            fetchPastEvents(20);
            break;
        }
      };

      return (
        <View>
          {/* Botones de filtro */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => handleFilterChange('active')}>
              <Text>Activos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilterChange('upcoming')}>
              <Text>Próximos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilterChange('past')}>
              <Text>Pasados</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de eventos */}
          {loadingStatus === 'loading' && <Text>Cargando...</Text>}
          {events.map(event => (
            <View key={event.id}>
              <Text>{event.name}</Text>
              <Text>Asistentes: {event.attendees_count}</Text>
            </View>
          ))}
        </View>
      );
    };
  `,

  /**
   * Ejemplo de uso directo de la API
   */
  directApiExample: `
    import React, { useEffect, useState } from 'react';
    import { getActiveEvents, getUpcomingEvents } from '@/core/event/actions/eventActions';

    const EventList = () => {
      const [events, setEvents] = useState([]);
      const [loading, setLoading] = useState(false);

      const loadEvents = async (filter: 'active' | 'upcoming') => {
        setLoading(true);
        try {
          const result = filter === 'active' 
            ? await getActiveEvents(10)
            : await getUpcomingEvents(10);
          
          if (result) {
            setEvents(result);
          }
        } catch (error) {
          console.error('Error loading events:', error);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        loadEvents('active');
      }, []);

      // Render component...
    };
  `
};

/**
 * Guía de migración para código existente
 */
export const migrationGuide = {
  
  /**
   * Antes (código existente)
   */
  before: `
    // Antes - solo obtenía todos los eventos
    const events = await getEvents();
    
    // En el store
    const { fetchEvents } = useEventStore();
    await fetchEvents();
  `,

  /**
   * Después (nuevo código)
   */
  after: `
    // Después - con filtros específicos
    const activeEvents = await getActiveEvents();
    const upcomingEvents = await getUpcomingEvents(5); // límite de 5
    const pastEvents = await getPastEvents();
    
    // En el store
    const { fetchActiveEvents, fetchUpcomingEvents } = useEventStore();
    await fetchActiveEvents();
    await fetchUpcomingEvents(10);
    
    // O usando el filtro genérico
    const { fetchEventsByFilter } = useEventStore();
    await fetchEventsByFilter('active', 20);
  `,

  /**
   * Compatibilidad
   */
  compatibility: `
    // Para mantener compatibilidad con código existente
    const events = await getAllEvents(); // Equivale a getActiveEvents()
    
    // El store sigue funcionando igual
    const { fetchEvents } = useEventStore(); // Sigue obteniendo eventos activos
  `
};

export default {
  directApiUsage,
  storeUsage,
  componentExamples,
  migrationGuide
};
