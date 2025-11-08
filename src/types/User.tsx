export interface User {
  id: number;
  username: string;
  password: string | null;
  email: string;
  nombreCompleto: string;
  telefono: string;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  roleId: number;
  roleNombre: string;
  [key: string]: string | number | boolean | null;
}