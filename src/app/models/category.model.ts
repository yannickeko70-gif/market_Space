import { CategoryId } from './product.model';

export interface Category {
  id: CategoryId;
  slug: string;
  name: string;
  icon: string;
  description: string;
}