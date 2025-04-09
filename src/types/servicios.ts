export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_min: number;
  peluqueria_id: number;
}

export type ServicioInput = Omit<Servicio, "id">;
