import { Routes } from '@angular/router';

/** Chaque page est chargée à la demande (lazy loading) pour alléger le premier chargement */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.HomePage) },
  {
    path: 'catalogue',
    loadComponent: () => import('./pages/catalogue/catalogue').then((m) => m.CataloguePage),
  },
  {
    path: 'produit/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetailPage),
  },
  {
    path: 'vendeur/:slug',
    loadComponent: () =>
      import('./pages/seller-detail/seller-detail').then((m) => m.SellerDetailPage),
  },
  { path: 'panier', loadComponent: () => import('./pages/cart/cart').then((m) => m.CartPage) },
  {
    path: 'favoris',
    loadComponent: () => import('./pages/favorites/favorites').then((m) => m.FavoritesPage),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
