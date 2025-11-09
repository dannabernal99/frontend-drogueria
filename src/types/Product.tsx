export interface Product {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  categoriaId: number;
  categoriaNombre: string;
  [key: string]: string | number | boolean | null;
}