import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { NotFoundPage } from '../not-found/not-found';

/** Page provisoire : le profil vendeur complet arrive à l'étape 6 */
@Component({
  selector: 'app-seller-detail-page',
  imports: [NotFoundPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (seller(); as s) {
      <section class="page container">
        <h1>{{ s.name }}</h1>
        <p class="page-lead">Le profil vendeur sera construit à l'étape 6.</p>
      </section>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class SellerDetailPage {
  private readonly data = inject(DataService);
  private readonly seo = inject(SeoService);

  /** Rempli par le routeur (withComponentInputBinding) depuis « vendeur/:slug » */
  readonly slug = input.required<string>();
  protected readonly seller = computed(() => this.data.getSellerBySlug(this.slug()));

  constructor() {
    effect(() => {
      const s = this.seller();
      if (s) this.seo.update({ title: s.name, path: `/vendeur/${s.slug}` });
    });
  }
}
