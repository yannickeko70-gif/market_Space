import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { NotFoundPage } from '../not-found/not-found';

/** Page provisoire : la fiche produit complète arrive à l'étape 6 */
@Component({
  selector: 'app-product-detail-page',
  imports: [NotFoundPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as p) {
      <section class="page container">
        <h1>{{ p.title }}</h1>
        <p class="page-lead">La fiche produit sera construite à l'étape 6.</p>
      </section>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class ProductDetailPage {
  private readonly data = inject(DataService);
  private readonly seo = inject(SeoService);

  /** Rempli par le routeur (withComponentInputBinding) depuis « produit/:slug » */
  readonly slug = input.required<string>();
  protected readonly product = computed(() => this.data.getProductBySlug(this.slug()));

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        this.seo.update({ title: p.title, description: p.description, path: `/produit/${p.slug}`, type: 'product' });
      }
    });
  }
}
