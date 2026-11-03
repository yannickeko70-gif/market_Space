import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { APP_CONFIG, STORAGE_KEYS } from '../constants/app.constants';
import { CartItem, CartLine } from '../models';
import { DataService } from './data.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly data = inject(DataService);
  private readonly storage = inject(StorageService);

  private readonly items = signal<CartItem[]>(this.restore());

  /** Lignes enrichies avec le produit (les produits disparus sont ignorés) */
  readonly lines = computed<CartLine[]>(() =>
    this.items().flatMap((item) => {
      const product = this.data.getProductById(item.productId);
      return product
        ? [{ product, quantity: item.quantity, total: product.price * item.quantity }]
        : [];
    }),
  );

  readonly count = computed(() => this.lines().reduce((n, l) => n + l.quantity, 0));
  readonly subtotal = computed(() => this.lines().reduce((sum, l) => sum + l.total, 0));
  readonly isEmpty = computed(() => this.lines().length === 0);

  constructor() {
    effect(() => this.storage.set(STORAGE_KEYS.cart, this.items()));
  }

  quantityOf(productId: string): number {
    return this.items().find((i) => i.productId === productId)?.quantity ?? 0;
  }

  add(productId: string, quantity = 1): void {
    this.setQuantity(productId, this.quantityOf(productId) + quantity);
  }

  setQuantity(productId: string, quantity: number): void {
    if (!this.data.getProductById(productId)) return;
    const qty = Math.min(Math.floor(quantity), APP_CONFIG.maxQuantity);
    if (qty <= 0) {
      this.remove(productId);
      return;
    }
    this.items.update((items) =>
      items.some((i) => i.productId === productId)
        ? items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
        : [...items, { productId, quantity: qty }],
    );
  }

  remove(productId: string): void {
    this.items.update((items) => items.filter((i) => i.productId !== productId));
  }

  clear(): void {
    this.items.set([]);
  }

  /** Relit le panier et écarte toute donnée invalide */
  private restore(): CartItem[] {
    const saved = this.storage.get<unknown>(STORAGE_KEYS.cart, []);
    if (!Array.isArray(saved)) return [];
    return saved
      .filter(
        (i): i is CartItem =>
          !!i && typeof i.productId === 'string' && Number.isFinite(i.quantity) && i.quantity > 0,
      )
      .filter((i) => !!this.data.getProductById(i.productId))
      .map((i) => ({
        productId: i.productId,
        quantity: Math.min(Math.floor(i.quantity), APP_CONFIG.maxQuantity),
      }));
  }
}