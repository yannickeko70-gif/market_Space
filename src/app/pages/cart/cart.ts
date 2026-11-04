import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../constants/app.constants';
import { CartService } from '../../services/cart.service';
import { SeoService } from '../../services/seo.service';
import { formatPrice } from '../../utils/format';
import { IconComponent } from '../../components/icon/icon';
import { PictureComponent } from '../../components/picture/picture';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, IconComponent, PictureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page container">
      <header class="page-head">
        <h1>Mon panier</h1>
        <p class="page-lead">Retrouvez les articles que vous souhaitez acheter. Votre panier est enregistré sur cet appareil.</p>
      </header>

      @if (cart.isEmpty()) {
        <div class="empty-state">
          <span class="category-icon"><app-icon name="bag" /></span>
          <h2>Votre panier est vide</h2>
          <p>Parcourez les sélections des vendeurs camerounais et ajoutez vos coups de cœur au panier.</p>
          <a routerLink="/catalogue" class="btn btn-primary">Découvrir le catalogue</a>
        </div>
      } @else {
        <div class="cart-layout">
          <ul class="cart-list" aria-label="Articles dans votre panier">
            @for (line of cart.lines(); track line.product.id) {
              <li class="cart-line">
                <a class="cart-thumb" [routerLink]="['/produit', line.product.slug]">
                  <app-picture
                    [src]="line.product.images[0].src"
                    [alt]="line.product.images[0].alt"
                    [width]="400"
                    [height]="500"
                    [widths]="[400, 800]"
                    sizes="(min-width: 40rem) 6rem, 5rem"
                  />
                </a>
                <div class="cart-line-info">
                  <h2><a [routerLink]="['/produit', line.product.slug]">{{ line.product.title }}</a></h2>
                  <p>{{ price(line.product.price) }} · Taille {{ line.product.size }} · {{ line.product.city }}</p>
                  <p class="muted">{{ line.product.title }}</p>
                </div>
                <div class="cart-line-actions">
                  <div class="qty-field">
                    <label [for]="'quantity-' + line.product.id">Quantité</label>
                    <div class="stepper">
                      <button
                        type="button"
                        class="icon-btn"
                        [attr.aria-label]="'Diminuer la quantité de ' + line.product.title"
                        (click)="changeQuantity(line.product.id, line.quantity - 1)"
                      >−</button>
                      <input
                        [id]="'quantity-' + line.product.id"
                        type="number"
                        min="1"
                        [max]="maxQuantity"
                        [value]="line.quantity"
                        [attr.aria-label]="'Quantité de ' + line.product.title"
                        (change)="setQuantity(line.product.id, $event)"
                      />
                      <button
                        type="button"
                        class="icon-btn"
                        [disabled]="line.quantity >= maxQuantity"
                        [attr.aria-label]="'Augmenter la quantité de ' + line.product.title"
                        (click)="changeQuantity(line.product.id, line.quantity + 1)"
                      >+</button>
                    </div>
                  </div>
                  <p class="cart-line-total">{{ price(line.total) }}</p>
                  <button
                    type="button"
                    class="btn btn-danger-ghost"
                    [attr.aria-label]="'Retirer « ' + line.product.title + ' » du panier'"
                    (click)="remove(line.product.id)"
                  >
                    <app-icon name="trash" /> Retirer
                  </button>
                </div>
              </li>
            }
          </ul>

          <aside class="cart-summary" aria-labelledby="summary-title">
            <h2 id="summary-title">Récapitulatif</h2>
            <dl class="summary-list">
              <div><dt>{{ cart.count() }} article{{ cart.count() > 1 ? 's' : '' }}</dt><dd>{{ price(cart.subtotal()) }}</dd></div>
              <div class="summary-total"><dt>Total estimé</dt><dd>{{ price(cart.subtotal()) }}</dd></div>
            </dl>
            <p class="summary-note">
              La remise et le paiement sont à convenir directement avec chaque vendeur. Vérifiez l'article avant de payer.
            </p>
            <a routerLink="/contact" class="btn btn-primary btn-block">Nous contacter pour la suite</a>
            <a routerLink="/catalogue" class="btn btn-ghost btn-block">Continuer mes achats</a>
            <button type="button" class="btn btn-danger-ghost btn-block" (click)="clear()">Vider le panier</button>
          </aside>
        </div>
      }
    </section>
  `,
})
export class CartPage {
  protected readonly cart = inject(CartService);
  protected readonly maxQuantity = APP_CONFIG.maxQuantity;

  constructor() {
    inject(SeoService).update({ title: 'Mon panier', path: '/panier', noindex: true });
  }

  protected price(amount: number): string {
    return formatPrice(amount);
  }

  protected changeQuantity(productId: string, quantity: number): void {
    this.cart.setQuantity(productId, quantity);
  }

  protected setQuantity(productId: string, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    this.cart.setQuantity(productId, Number.isFinite(quantity) ? quantity : 1);
  }

  protected remove(productId: string): void {
    this.cart.remove(productId);
  }

  protected clear(): void {
    this.cart.clear();
  }
}
