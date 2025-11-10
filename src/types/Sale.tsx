export interface Sale {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  fechaCompra: string;
  [key: string]: string | number | boolean | null;
}