import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/app.constants';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(StorageService);

  readonly theme = signal<Theme>(this.initialTheme());
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Garde l'attribut data-theme du <html> synchronisé avec le signal
    effect(() => this.doc.documentElement.setAttribute('data-theme', this.theme()));
  }

  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    this.storage.set(STORAGE_KEYS.theme, theme);
  }

    private initialTheme(): Theme {
    const saved = this.storage.get<string | null>(STORAGE_KEYS.theme, null);
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark =
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}