import { Injectable } from '@angular/core';
import productsJson from '../data/products.json';
import sellersJson from '../data/sellers.json';
import categoriesJson from '../data/categories.json';
import reviewsJson from '../data/reviews.json';
import { Category, Product, Review, Seller } from '../models';

/** Accès aux données JSON (embarquées dans le bundle, donc synchrones) */
@Injectable({ providedIn: 'root' })
export class DataService {
  readonly products = productsJson as Product[];
  readonly sellers = sellersJson as Seller[];
  readonly categories = categoriesJson as Category[];
  readonly reviews = [...(reviewsJson as Review[])].sort((a, b) => b.date.localeCompare(a.date));

  private readonly productsById = new Map(this.products.map((p) => [p.id, p]));
  private readonly productsBySlug = new Map(this.products.map((p) => [p.slug, p]));
  private readonly sellersById = new Map(this.sellers.map((s) => [s.id, s]));
  private readonly sellersBySlug = new Map(this.sellers.map((s) => [s.slug, s]));
  private readonly categoriesById = new Map(this.categories.map((c) => [c.id as string, c]));

  getProductById(id: string): Product | undefined {
    return this.productsById.get(id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.productsBySlug.get(slug);
  }

  getSellerById(id: string): Seller | undefined {
    return this.sellersById.get(id);
  }

  getSellerBySlug(slug: string): Seller | undefined {
    return this.sellersBySlug.get(slug);
  }

  getCategoryById(id: string): Category | undefined {
    return this.categoriesById.get(id);
  }

  getProductsBySeller(sellerId: string): Product[] {
    return this.products.filter((p) => p.sellerId === sellerId);
  }

  getReviewsByProduct(productId: string): Review[] {
    return this.reviews.filter((r) => r.productId === productId);
  }

  getReviewsBySeller(sellerId: string): Review[] {
    return this.reviews.filter((r) => r.sellerId === sellerId);
  }

  /** Mêmes catégorie d'abord, puis les plus récents */
  getRelatedProducts(product: Product, limit = 4): Product[] {
    return this.products
      .filter((p) => p.id !== product.id)
      .sort((a, b) => {
        const sameA = a.category === product.category ? 1 : 0;
        const sameB = b.category === product.category ? 1 : 0;
        return sameB - sameA || b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, limit);
  }

  getLatestProducts(limit = 8): Product[] {
    return [...this.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }

  /** Note moyenne (1 décimale) et nombre d'avis */
  summarizeRatings(reviews: Review[]): { average: number; count: number } {
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((total, r) => total + r.rating, 0);
    return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
  }
}