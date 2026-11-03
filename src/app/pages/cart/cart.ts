import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../services/seo.service';

/** Page provisoire : le contenu réel arrive à l'étape 7 */
@Component({
  selector: 'app-cart-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page container">
      <h1>Mon panier</h1>
      <p class="page-lead">Cette page sera construite à l'étape 7.</p>
    </section>
  `,
})
export class CartPage {
  constructor() {
    inject(SeoService).update({ title: 'Mon panier', path: '/panier', noindex: true });
  }
}
