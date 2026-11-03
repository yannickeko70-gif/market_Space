import { ConditionId } from '../models';

export const APP_CONFIG = {
  siteName: 'MarketSpace',
  siteUrl: 'https://www.marketspace.cm',
  defaultImage: 'https://www.marketspace.cm/assets/img/og-image.jpg',
  defaultDescription:
    'Achetez et vendez des vêtements, chaussures et accessoires de seconde main partout au Cameroun. Prix en FCFA.',
  pageSize: 12,     // articles affichés par « Charger plus »
  maxQuantity: 5,   // quantité maximale par article dans le panier
  storagePrefix: 'marketspace.',
} as const;

export interface ConditionInfo {
  id: ConditionId;
  label: string;
  schema: string; // valeur schema.org pour les données structurées
}

export const CONDITIONS: readonly ConditionInfo[] = [
  { id: 'neuf-etiquette', label: 'Neuf avec étiquette', schema: 'https://schema.org/NewCondition' },
  { id: 'tres-bon', label: 'Très bon état', schema: 'https://schema.org/UsedCondition' },
  { id: 'bon', label: 'Bon état', schema: 'https://schema.org/UsedCondition' },
  { id: 'satisfaisant', label: 'Satisfaisant', schema: 'https://schema.org/UsedCondition' },
];

export function getCondition(id: ConditionId): ConditionInfo {
  return CONDITIONS.find((c) => c.id === id) ?? CONDITIONS[2];
}

/** Clés de stockage (le préfixe est ajouté par StorageService) */
export const STORAGE_KEYS = {
  theme: 'theme',          // même clé que le script de index.html
  cart: 'cart',
  favorites: 'favorites',
} as const;