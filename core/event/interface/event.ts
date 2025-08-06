/* Interfaces para el manejo de eventos */

export interface Event {
  id: number;
  name: string;
  description?: string;
  latitude: string | number; // Tu API retorna string
  longitude: string | number; // Tu API retorna string
  address?: string;
  allowed_radius: string | number; // Tu API retorna string
  start_time: string; // formato ISO: "2025-07-29T21:32:00.000000Z"
  end_time: string;   // formato ISO: "2025-07-29T21:32:00.000000Z"
  created_at: string;
  updated_at: string;
  attendees_count: number,
  // Campos adicionales que retorna tu API
  user_id: number;
  qr_code: string;
  user?: {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: string;
    employee_id: string;
    created_at: string;
    updated_at: string;
  };
  // Campos opcionales adicionales
  active: boolean; // Tu API retorna "active" no "is_active"
  /* attendances_count?: number; */
}

export interface CreateEventRequest {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  allowed_radius: number;
  start_time: string; // formato: "YYYY-MM-DD HH:MM" (se convertirá a ISO en el backend)
  end_time: string;   // formato: "YYYY-MM-DD HH:MM" (se convertirá a ISO en el backend)
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: number;
}

export interface EventsResponse {
  success: boolean;
  data?: Event[];
  events?: Event[]; // Por si tu API usa 'events' en lugar de 'data'
  message?: string;
}

export interface EventResponse {
  success: boolean;
  event: Event; // Tu API usa 'event' en lugar de 'data'
  message: string;
}

export interface DeleteEventResponse {
  success: boolean;
  message: string;
}
