import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { DataService } from './services/data.service';

export const serverRoutes: ServerRoute[] = [
  // Une page HTML statique par produit et par vendeur (bon pour le SEO)
  {
    path: 'produit/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => inject(DataService).products.map((p) => ({ slug: p.slug })),
  },
  {
    path: 'vendeur/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => inject(DataService).sellers.map((s) => ({ slug: s.slug })),
  },
  // Pages qui dépendent du localStorage du visiteur : rendues dans le navigateur
  { path: 'panier', renderMode: RenderMode.Client },
  { path: 'favoris', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
