import { Product } from './product.model';

/** Ce qui est stocké dans le navigateur */
export interface CartItem {
  productId: string;
  quantity: number;
}

/** Ligne enrichie, utilisée à l'affichage */
export interface CartLine {
  product: Product;
  quantity: number;
  total: number;
}