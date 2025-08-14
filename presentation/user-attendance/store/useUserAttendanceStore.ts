/* Store Zustand para manejo de asistencias del usuario */

import { create } from "zustand";
import {
  UserAttendance,
  UserAttendanceLoadingStatus,
  UserAttendanceStats,
  UserAttendanceFilters,
  AttendancesByEvent,
  AttendancesByDate,
  GetMyAttendancesParams
} from "@/core/user-attendance/interface/userAttendance";
import {
  getMyAttendances,
  getMyAttendanceStats,
  groupAttendancesByEvent,
  groupAttendancesByDate,
  filterAttendances,
  searchAttendancesByEventName,
  calculateAttendanceStats
} from "@/core/user-attendance/actions/userAttendanceActions";

/**
 * Estado del store de asistencias del usuario
 */
interface UserAttendanceState {
  // Estados principales
  attendances: UserAttendance[];
  filteredAttendances: UserAttendance[];
  loadingStatus: UserAttendanceLoadingStatus;
  error: string | undefined;
  
  // Estadísticas
  stats: UserAttendanceStats | null;
  
  // Agrupaciones
  attendancesByEvent: AttendancesByEvent[];
  attendancesByDate: AttendancesByDate[];
  
  // Filtros y búsqueda
  currentFilters: UserAttendanceFilters;
  searchTerm: string;
  
  // Estados de carga específicos
  isLoadingStats: boolean;
  
  // Acciones principales
  fetchMyAttendances: (params?: GetMyAttendancesParams) => Promise<boolean>;
  fetchMyAttendanceStats: () => Promise<boolean>;
  
  // Acciones de filtrado y búsqueda
  setFilters: (filters: UserAttendanceFilters) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Acciones de agrupación
  groupByEvent: () => void;
  groupByDate: () => void;
  
  // Acciones de utilidad
  refreshData: () => Promise<boolean>;
  clearError: () => void;
  setLoadingStatus: (status: UserAttendanceLoadingStatus) => void;
}

/**
 * Store principal para asistencias del usuario
 */
export const useUserAttendanceStore = create<UserAttendanceState>()((set, get) => ({
  // Estado inicial
  attendances: [],
  filteredAttendances: [],
  loadingStatus: 'idle',
  error: undefined,
  stats: null,
  attendancesByEvent: [],
  attendancesByDate: [],
  currentFilters: {},
  searchTerm: '',
  isLoadingStats: false,

  /**
   * Obtiene las asistencias del usuario
   */
  fetchMyAttendances: async (params?: GetMyAttendancesParams): Promise<boolean> => {
    try {
      console.log('📋 Cargando asistencias del usuario...', params);
      set({ loadingStatus: 'loading', error: undefined });

      const attendances = await getMyAttendances(params);

      if (attendances) {
        console.log('✅ Asistencias cargadas exitosamente:', attendances.length);
        
        // Aplicar filtros y búsqueda actuales
        const { currentFilters, searchTerm } = get();
        let filtered = attendances;
        
        // Aplicar filtros
        if (currentFilters.verified !== undefined) {
          filtered = filterAttendances(filtered, currentFilters.verified);
        }
        
        // Aplicar búsqueda
        if (searchTerm.trim()) {
          filtered = searchAttendancesByEventName(filtered, searchTerm);
        }

        set({
          attendances,
          filteredAttendances: filtered,
          loadingStatus: 'success',
          error: undefined
        });

        // Actualizar agrupaciones
        get().groupByEvent();
        get().groupByDate();

        return true;
      } else {
        console.log('❌ No se pudieron cargar las asistencias');
        set({
          loadingStatus: 'error',
          error: 'No se pudieron cargar las asistencias'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Error inesperado al cargar asistencias:', error);
      set({
        loadingStatus: 'error',
        error: 'Error inesperado al cargar asistencias'
      });
      return false;
    }
  },

  /**
   * Obtiene las estadísticas de asistencias del usuario
   */
  fetchMyAttendanceStats: async (): Promise<boolean> => {
    try {
      console.log('📊 Cargando estadísticas de asistencias...');
      set({ isLoadingStats: true });

      const stats = await getMyAttendanceStats();

      if (stats) {
        console.log('✅ Estadísticas cargadas exitosamente');
        set({ stats, isLoadingStats: false });
        return true;
      } else {
        // Si no hay estadísticas de la API, calcular localmente
        const { attendances } = get();
        if (attendances.length > 0) {
          const calculatedStats = calculateAttendanceStats(attendances);
          set({ stats: calculatedStats, isLoadingStats: false });
          return true;
        }
        
        console.log('❌ No se pudieron cargar las estadísticas');
        set({ isLoadingStats: false });
        return false;
      }
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      set({ isLoadingStats: false });
      return false;
    }
  },

  /**
   * Establece filtros y actualiza la lista filtrada
   */
  setFilters: (filters: UserAttendanceFilters) => {
    console.log('🔍 Aplicando filtros:', filters);
    const { attendances, searchTerm } = get();
    
    let filtered = attendances;
    
    // Aplicar filtros
    if (filters.verified !== undefined) {
      filtered = filterAttendances(filtered, filters.verified);
    }
    
    // Aplicar búsqueda actual
    if (searchTerm.trim()) {
      filtered = searchAttendancesByEventName(filtered, searchTerm);
    }

    set({
      currentFilters: filters,
      filteredAttendances: filtered
    });

    // Actualizar agrupaciones
    get().groupByEvent();
    get().groupByDate();
  },

  /**
   * Establece término de búsqueda y actualiza la lista filtrada
   */
  setSearchTerm: (term: string) => {
    console.log('🔍 Aplicando búsqueda:', term);
    const { attendances, currentFilters } = get();
    
    let filtered = attendances;
    
    // Aplicar filtros actuales
    if (currentFilters.verified !== undefined) {
      filtered = filterAttendances(filtered, currentFilters.verified);
    }
    
    // Aplicar búsqueda
    if (term.trim()) {
      filtered = searchAttendancesByEventName(filtered, term);
    }

    set({
      searchTerm: term,
      filteredAttendances: filtered
    });

    // Actualizar agrupaciones
    get().groupByEvent();
    get().groupByDate();
  },

  /**
   * Limpia todos los filtros y búsqueda
   */
  clearFilters: () => {
    console.log('🧹 Limpiando filtros y búsqueda');
    const { attendances } = get();
    
    set({
      currentFilters: {},
      searchTerm: '',
      filteredAttendances: attendances
    });

    // Actualizar agrupaciones
    get().groupByEvent();
    get().groupByDate();
  },

  /**
   * Agrupa las asistencias por evento
   */
  groupByEvent: () => {
    const { filteredAttendances } = get();
    const grouped = groupAttendancesByEvent(filteredAttendances);
    set({ attendancesByEvent: grouped });
  },

  /**
   * Agrupa las asistencias por fecha
   */
  groupByDate: () => {
    const { filteredAttendances } = get();
    const grouped = groupAttendancesByDate(filteredAttendances);
    set({ attendancesByDate: grouped });
  },

  /**
   * Refresca todos los datos
   */
  refreshData: async (): Promise<boolean> => {
    console.log('🔄 Refrescando datos de asistencias...');
    const attendancesSuccess = await get().fetchMyAttendances();
    const statsSuccess = await get().fetchMyAttendanceStats();
    return attendancesSuccess && statsSuccess;
  },

  /**
   * Limpia el error actual
   */
  clearError: () => {
    set({ error: undefined });
  },

  /**
   * Establece el estado de carga
   */
  setLoadingStatus: (status: UserAttendanceLoadingStatus) => {
    set({ loadingStatus: status });
  }
}));
