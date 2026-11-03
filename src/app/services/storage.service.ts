import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../constants/app.constants';

/** localStorage sécurisé : ne plante jamais (navigation privée, quota, JSON invalide) */
@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(APP_CONFIG.storagePrefix + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  set(key: string, value: unknown): void {
    try {
      window.localStorage.setItem(APP_CONFIG.storagePrefix + key, JSON.stringify(value));
    } catch {
      /* stockage indisponible : on ignore */
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(APP_CONFIG.storagePrefix + key);
    } catch {
      /* ignoré */
    }
  }
}