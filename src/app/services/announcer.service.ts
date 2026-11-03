import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/** Annonces pour lecteurs d'écran (zone aria-live créée à la demande) */
@Injectable({ providedIn: 'root' })
export class AnnouncerService {
  private readonly doc = inject(DOCUMENT);
  private region: HTMLElement | null = null;

  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    const region = this.getRegion();
    region.setAttribute('aria-live', politeness);
    region.textContent = '';
    // Petit délai : un texte identique est ainsi relu par le lecteur d'écran
    setTimeout(() => (region.textContent = message), 50);
  }

  private getRegion(): HTMLElement {
    if (!this.region) {
      const el = this.doc.createElement('div');
      el.className = 'visually-hidden';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-atomic', 'true');
      this.doc.body.appendChild(el);
      this.region = el;
    }
    return this.region;
  }
}