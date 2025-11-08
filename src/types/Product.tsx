export interface Product {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  [key: string]: string | number | boolean | null;
}