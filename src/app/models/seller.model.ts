import { ImageAsset } from './product.model';

export interface Seller {
  id: string;
  slug: string;
  name: string;
  city: string;
  bio: string;
  joinedAt: string;
  responseTime: string;
  verified: boolean;
  avatar: ImageAsset;
}