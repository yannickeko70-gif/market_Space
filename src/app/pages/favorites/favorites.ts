import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { SeoService } from '../../services/seo.service';
import { IconComponent } from '../../components/icon/icon';
import { ProductCardComponent } from '../../components/product-card/product-card';

@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink, IconComponent, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page container">
      <header class="page-head">
        <h1>Mes favoris</h1>
        <p class="page-lead">Gardez vos articles préférés à portée de main. Vos favoris sont enregistrés sur cet appareil.</p>
      </header>

      @if (favorites.products().length) {
        <p class="muted">{{ favorites.count() }} article{{ favorites.count() > 1 ? 's' : '' }} enregistré{{ favorites.count() > 1 ? 's' : '' }}</p>
        <ul class="product-grid">
          @for (product of favorites.products(); track product.id) {
            <li><app-product-card [product]="product" /></li>
          }
        </ul>
      } @else {
        <div class="empty-state">
          <span class="category-icon"><app-icon name="heart" /></span>
          <h2>Vous n'avez pas encore de favoris</h2>
          <p>Enregistrez les articles qui vous plaisent en appuyant sur le cœur, puis retrouvez-les ici.</p>
          <a routerLink="/catalogue" class="btn btn-primary">Explorer le catalogue</a>
        </div>
      }
    </section>
  `,
})
export class FavoritesPage {
  protected readonly favorites = inject(FavoritesService);

  constructor() {
    inject(SeoService).update({ title: 'Mes favoris', path: '/favoris', noindex: true });
  }
}
