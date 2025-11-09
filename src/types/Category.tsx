export interface Category {
  id: number;
  name: string;
  description: string | null;
  [key: string]: string | number | boolean | null;
}