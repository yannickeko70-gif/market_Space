import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getCondition } from '../../constants/app.constants';
import { Product } from '../../models';
import { AnnouncerService } from '../../services/announcer.service';
import { FavoritesService } from '../../services/favorites.service';
import { formatPrice } from '../../utils/format';
import { IconComponent } from '../icon/icon';
import { PictureComponent } from '../picture/picture';
import { RatingComponent } from '../rating/rating';

/** Carte article : toute la carte est cliquable, le bouton « favori » reste indépendant */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, IconComponent, PictureComponent, RatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = product();
    <article class="card">
      <div class="card-media">
        <app-picture
          [src]="p.images[0].src"
          [alt]="p.images[0].alt"
          [width]="400"
          [height]="500"
          [widths]="[400, 800]"
          sizes="(min-width: 64rem) 20vw, (min-width: 40rem) 33vw, 50vw"
        />
        <button
          type="button"
          class="icon-btn card-fav"
          [attr.aria-pressed]="favorites.isFavorite(p.id)"
          (click)="toggleFavorite()"
        >
          <app-icon name="heart" />
          <span class="visually-hidden">Ajouter « {{ p.title }} » aux favoris</span>
        </button>
        <span class="card-condition">{{ condition().label }}</span>
      </div>
      <div class="card-body">
        <p class="card-price">{{ price() }}</p>
        <h3 class="card-title">
          <a [routerLink]="['/produit', p.slug]">{{ p.title }}</a>
        </h3>
        <p class="card-meta">
          <span>Taille {{ p.size }}</span>
          <span class="inline-icon"><app-icon name="pin" />{{ p.city }}</span>
          @if (p.rating !== null) {
            <app-rating [value]="p.rating" />
          } @else {
            <span class="muted">Pas encore d'avis</span>
          }
        </p>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  protected readonly favorites = inject(FavoritesService);
  private readonly announcer = inject(AnnouncerService);

  protected condition() {
    return getCondition(this.product().condition);
  }

  protected price(): string {
    return formatPrice(this.product().price);
  }

  protected toggleFavorite(): void {
    const p = this.product();
    this.favorites.toggle(p.id);
    this.announcer.announce(
      this.favorites.isFavorite(p.id)
        ? `« ${p.title} » ajouté aux favoris`
        : `« ${p.title} » retiré des favoris`,
    );
  }
}
