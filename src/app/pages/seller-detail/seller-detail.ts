import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seller } from '../../models';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { formatDate } from '../../utils/format';
import { IconComponent } from '../../components/icon/icon';
import { PictureComponent } from '../../components/picture/picture';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { RatingComponent } from '../../components/rating/rating';
import { NotFoundPage } from '../not-found/not-found';

@Component({
  selector: 'app-seller-detail-page',
  imports: [RouterLink, IconComponent, PictureComponent, ProductCardComponent, RatingComponent, NotFoundPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (seller(); as s) {
      @let products = sellerProducts();
      @let reviews = sellerReviews();
      @let rating = data.summarizeRatings(reviews);
      <section class="page container">
        <nav class="breadcrumb" aria-label="Fil d'Ariane">
          <ol>
            <li><a routerLink="/">Accueil</a></li>
            <li><a routerLink="/catalogue">Catalogue</a></li>
            <li><span aria-current="page">{{ s.name }}</span></li>
          </ol>
        </nav>

        <header class="seller-hero">
          <span class="avatar avatar-lg">
            <app-picture
              [src]="s.avatar.src"
              [alt]="s.avatar.alt"
              [width]="s.avatar.width"
              [height]="s.avatar.height"
              [widths]="[96, 192]"
              sizes="6rem"
            />
          </span>
          <div class="seller-hero-body">
            <h1>
              {{ s.name }}
              @if (s.verified) {
                <span class="verified"><app-icon name="shield" class="icon-sm" />Vendeur vérifié</span>
              }
            </h1>
            <p class="seller-meta">
              <span class="inline-icon"><app-icon name="pin" />{{ s.city }}, Cameroun</span>
              <span>Répond généralement en {{ s.responseTime }}</span>
            </p>
            <p>{{ s.bio }}</p>
            <dl class="seller-stats">
              <div><dt>Articles en vente</dt><dd>{{ products.length }}</dd></div>
              <div><dt>Avis reçus</dt><dd>{{ rating.count }}</dd></div>
              <div>
                <dt>Note moyenne</dt>
                <dd>
                  @if (rating.count) {
                    <app-rating [value]="rating.average" [count]="rating.count" />
                  } @else {
                    Pas encore noté
                  }
                </dd>
              </div>
              <div><dt>Membre depuis</dt><dd><time [attr.datetime]="s.joinedAt">{{ date(s.joinedAt) }}</time></dd></div>
            </dl>
          </div>
        </header>

        <section aria-labelledby="seller-products-title">
          <div class="section-head">
            <h2 id="seller-products-title">Les articles de {{ s.name }}</h2>
            <a routerLink="/catalogue" [queryParams]="{ ville: s.city }" class="link-arrow">
              Voir les articles à {{ s.city }} <app-icon name="arrow" class="icon-sm" />
            </a>
          </div>
          @if (products.length) {
            <ul class="product-grid">
              @for (product of products; track product.id) {
                <li><app-product-card [product]="product" /></li>
              }
            </ul>
          } @else {
            <div class="empty-state">
              <h2>Aucun article en vente pour le moment</h2>
              <p>Consultez le catalogue pour découvrir d'autres vendeurs.</p>
              <a routerLink="/catalogue" class="btn btn-primary">Voir le catalogue</a>
            </div>
          }
        </section>

        <section class="section" aria-labelledby="seller-reviews-title">
          <div class="section-head">
            <h2 id="seller-reviews-title">Avis sur {{ s.name }}</h2>
          </div>
          @if (reviews.length) {
            <ul class="review-list">
              @for (review of reviews; track review.id) {
                <li class="review">
                  <div class="review-head">
                    <p class="review-author">{{ review.author }}</p>
                    <app-rating [value]="review.rating" />
                  </div>
                  <p>{{ review.comment }}</p>
                  <p>
                    <time [attr.datetime]="review.date">{{ date(review.date) }}</time>
                    @if (data.getProductById(review.productId); as product) {
                      · <a [routerLink]="['/produit', product.slug]">{{ product.title }}</a>
                    }
                  </p>
                </li>
              }
            </ul>
          } @else {
            <p class="muted">Ce vendeur n'a pas encore reçu d'avis.</p>
          }
        </section>
      </section>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class SellerDetailPage {
  protected readonly data = inject(DataService);
  private readonly seo = inject(SeoService);

  readonly slug = input.required<string>();
  protected readonly seller = computed(() => this.data.getSellerBySlug(this.slug()));
  protected readonly sellerProducts = computed(() => {
    const seller = this.seller();
    return seller ? this.data.getProductsBySeller(seller.id) : [];
  });
  protected readonly sellerReviews = computed(() => {
    const seller = this.seller();
    return seller ? this.data.getReviewsBySeller(seller.id) : [];
  });

  constructor() {
    effect(() => {
      const seller = this.seller();
      if (!seller) return;
      this.seo.update({
        title: `${seller.name} – Boutique à ${seller.city}`,
        description: `${seller.bio} Découvrez les articles de ${seller.name} sur MarketSpace, marketplace de mode de seconde main au Cameroun.`,
        path: `/vendeur/${seller.slug}`,
      });
    });
  }

  protected date(value: string): string {
    return formatDate(value);
  }
}
