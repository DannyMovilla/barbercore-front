export interface User {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  token?: string;
  peluqueria?: string;
  peluqueria_id?: string;
  nombre?: string;
  telefono?: string;
  rol?: string;
  password?: string;
  created_at?: Date;
}

export type RolUsuario = "cliente" | "barbero" | "admin"