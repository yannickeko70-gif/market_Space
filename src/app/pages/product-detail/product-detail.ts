import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getCondition } from '../../constants/app.constants';
import { Product, Review } from '../../models';
import { AnnouncerService } from '../../services/announcer.service';
import { CartService } from '../../services/cart.service';
import { DataService } from '../../services/data.service';
import { FavoritesService } from '../../services/favorites.service';
import { SeoService } from '../../services/seo.service';
import { formatDate, formatPrice } from '../../utils/format';
import { IconComponent } from '../../components/icon/icon';
import { PictureComponent } from '../../components/picture/picture';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { RatingComponent } from '../../components/rating/rating';
import { NotFoundPage } from '../not-found/not-found';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    RouterLink,
    IconComponent,
    PictureComponent,
    ProductCardComponent,
    RatingComponent,
    NotFoundPage,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as p) {
      @let seller = data.getSellerById(p.sellerId);
      @let reviews = productReviews();
      <section class="page container">
        <nav class="breadcrumb" aria-label="Fil d'Ariane">
          <ol>
            <li><a routerLink="/">Accueil</a></li>
            <li>
              <a routerLink="/catalogue" [queryParams]="{ categorie: data.getCategoryById(p.category)?.slug }">
                {{ data.getCategoryById(p.category)?.name ?? 'Catalogue' }}
              </a>
            </li>
            <li><span aria-current="page">{{ p.title }}</span></li>
          </ol>
        </nav>

        <div class="product-detail">
          <div class="product-gallery">
            <figure class="gallery-main">
              <app-picture
                [src]="currentImage(p).src"
                [alt]="currentImage(p).alt"
                [width]="currentImage(p).width"
                [height]="currentImage(p).height"
                [widths]="[400, 800]"
                sizes="(min-width: 64rem) 50vw, 100vw"
                [priority]="true"
              />
              <figcaption class="gallery-caption">
                Photo {{ imageIndex() + 1 }} sur {{ p.images.length }} — {{ currentImage(p).alt }}
              </figcaption>
            </figure>

            @if (p.images.length > 1) {
              <ul class="gallery-thumbs" aria-label="Autres vues du produit">
                @for (image of p.images; track image.src; let i = $index) {
                  <li>
                    <button
                      type="button"
                      class="thumb"
                      [attr.aria-current]="imageIndex() === i ? 'true' : null"
                      [attr.aria-label]="'Afficher la photo ' + (i + 1) + ' : ' + image.alt"
                      (click)="selectImage(i)"
                    >
                      <app-picture
                        [src]="image.src"
                        [alt]="image.alt"
                        [width]="image.width"
                        [height]="image.height"
                        [widths]="[400, 800]"
                        sizes="4.5rem"
                      />
                    </button>
                  </li>
                }
              </ul>
            }
          </div>

          <article class="product-info">
            <p class="eyebrow">{{ data.getCategoryById(p.category)?.name }} · {{ p.city }}</p>
            <h1>{{ p.title }}</h1>
            <p class="product-price">{{ price(p.price) }}</p>
            @if (p.rating !== null) {
              <app-rating [value]="p.rating" [count]="reviews.length" />
            } @else {
              <p class="muted">Pas encore d'avis pour cet article.</p>
            }
            <p>{{ p.description }}</p>

            <dl class="spec-list">
              <div><dt>État</dt><dd>{{ condition(p).label }}</dd></div>
              <div><dt>Taille</dt><dd>{{ p.size }}</dd></div>
              <div><dt>Ville</dt><dd>{{ p.city }}</dd></div>
              <div><dt>Référence</dt><dd>{{ p.id }}</dd></div>
            </dl>

            <div class="product-actions">
              <div class="qty-field">
                <label for="product-quantity">Quantité</label>
                <input
                  id="product-quantity"
                  type="number"
                  min="1"
                  max="5"
                  step="1"
                  inputmode="numeric"
                  [value]="quantity()"
                  (change)="setQuantity($event)"
                />
              </div>
              <button type="button" class="btn btn-primary" (click)="addToCart(p)">
                <app-icon name="bag" /> Ajouter au panier
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                [attr.aria-pressed]="favorites.isFavorite(p.id)"
                (click)="toggleFavorite(p)"
              >
                <app-icon name="heart" />
                {{ favorites.isFavorite(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
              </button>
            </div>

            @if (seller; as s) {
              <aside class="seller-box" aria-labelledby="seller-box-title">
                <span class="avatar">
                  <img
                    [src]="'/' + s.avatar.src"
                    [alt]="s.avatar.alt"
                    [width]="s.avatar.width"
                    [height]="s.avatar.height"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <div>
                  <h2 id="seller-box-title"><a [routerLink]="['/vendeur', s.slug]">{{ s.name }}</a></h2>
                  <p class="seller-meta">
                    <span class="inline-icon"><app-icon name="pin" />{{ s.city }}</span>
                    @if (s.verified) { <span class="verified"><app-icon name="shield" class="icon-sm" />Vérifié</span> }
                  </p>
                </div>
              </aside>
            }
          </article>
        </div>

        <section class="section" aria-labelledby="product-reviews-title">
          <div class="section-head">
            <h2 id="product-reviews-title">Avis sur cet article</h2>
            <span class="muted">{{ reviews.length }} avis</span>
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
                  <p><time [attr.datetime]="review.date">{{ date(review.date) }}</time></p>
                </li>
              }
            </ul>
          } @else {
            <p class="muted">Soyez le premier à partager votre expérience sur cet article.</p>
          }
        </section>

        @if (relatedProducts().length) {
          <section class="section section-alt" aria-labelledby="related-title">
            <div class="container">
              <div class="section-head">
                <h2 id="related-title">Vous aimerez aussi</h2>
                <a routerLink="/catalogue" class="link-arrow">Tout le catalogue <app-icon name="arrow" class="icon-sm" /></a>
              </div>
              <ul class="product-grid">
                @for (related of relatedProducts(); track related.id) {
                  <li><app-product-card [product]="related" /></li>
                }
              </ul>
            </div>
          </section>
        }
      </section>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class ProductDetailPage {
  protected readonly data = inject(DataService);
  private readonly seo = inject(SeoService);
  private readonly cart = inject(CartService);
  private readonly announcer = inject(AnnouncerService);
  protected readonly favorites = inject(FavoritesService);

  readonly slug = input.required<string>();
  protected readonly product = computed(() => this.data.getProductBySlug(this.slug()));
  protected readonly productReviews = computed(() => {
    const product = this.product();
    return product ? this.data.getReviewsByProduct(product.id) : [];
  });
  protected readonly relatedProducts = computed(() => {
    const product = this.product();
    return product ? this.data.getRelatedProducts(product) : [];
  });
  protected readonly imageIndex = signal(0);
  protected readonly quantity = signal(1);

  constructor() {
    effect(() => {
      const product = this.product();
      if (!product) return;
      this.seo.update({
        title: product.title,
        description: product.description,
        path: `/produit/${product.slug}`,
        image: product.images[0]?.src,
        type: 'product',
        jsonLd: [
          this.seo.buildProductSchema(
            product,
            this.data.getSellerById(product.sellerId),
            this.productReviews(),
          ),
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.marketspace.cm/' },
              { '@type': 'ListItem', position: 2, name: 'Catalogue', item: 'https://www.marketspace.cm/catalogue' },
              { '@type': 'ListItem', position: 3, name: product.title, item: `https://www.marketspace.cm/produit/${product.slug}` },
            ],
          },
        ],
      });
    });
  }

  protected currentImage(product: Product) {
    return product.images[Math.min(this.imageIndex(), product.images.length - 1)] ?? product.images[0];
  }

  protected selectImage(index: number): void {
    this.imageIndex.set(index);
  }

  protected condition(product: Product) {
    return getCondition(product.condition);
  }

  protected price(amount: number): string {
    return formatPrice(amount);
  }

  protected date(value: string): string {
    return formatDate(value);
  }

  protected setQuantity(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.quantity.set(Number.isFinite(value) ? Math.min(5, Math.max(1, Math.floor(value))) : 1);
  }

  protected addToCart(product: Product): void {
    this.cart.add(product.id, this.quantity());
    this.announcer.announce(`${this.quantity()} exemplaire${this.quantity() > 1 ? 's' : ''} de « ${product.title} » ajouté${this.quantity() > 1 ? 's' : ''} au panier`);
  }

  protected toggleFavorite(product: Product): void {
    this.favorites.toggle(product.id);
    this.announcer.announce(
      this.favorites.isFavorite(product.id)
        ? `« ${product.title} » ajouté aux favoris`
        : `« ${product.title} » retiré des favoris`,
    );
  }
}
