import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/app.constants';
import { Product } from '../models';
import { DataService } from './data.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly data = inject(DataService);
  private readonly storage = inject(StorageService);

  private readonly ids = signal<string[]>(this.restore());

  readonly count = computed(() => this.ids().length);
  readonly products = computed<Product[]>(() =>
    this.ids().flatMap((id) => {
      const p = this.data.getProductById(id);
      return p ? [p] : [];
    }),
  );
  private readonly idSet = computed(() => new Set(this.ids()));

  constructor() {
    effect(() => this.storage.set(STORAGE_KEYS.favorites, this.ids()));
  }

  isFavorite(productId: string): boolean {
    return this.idSet().has(productId);
  }

  toggle(productId: string): void {
    this.ids.update((ids) =>
      ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId],
    );
  }

  private restore(): string[] {
    const saved = this.storage.get<unknown>(STORAGE_KEYS.favorites, []);
    return Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === 'string' && !!this.data.getProductById(id))
      : [];
  }
}