export type CategoryId = 'femme' | 'homme' | 'chaussures' | 'sacs' | 'accessoires' | 'enfants';
export type ConditionId = 'neuf-etiquette' | 'tres-bon' | 'bon' | 'satisfaisant';

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: 'XAF';
  category: CategoryId;
  size: string;
  condition: ConditionId;
  city: string;
  images: ImageAsset[];
  sellerId: string;
  /** null = pas encore d'avis */
  rating: number | null;
  createdAt: string; // AAAA-MM-JJ
}