import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../services/seo.service';

/** Page provisoire : le contenu réel arrive à l'étape 5 */
@Component({
  selector: 'app-catalogue-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page container">
      <h1>Catalogue</h1>
      <p class="page-lead">Cette page sera construite à l'étape 5.</p>
    </section>
  `,
})
export class CataloguePage {
  constructor() {
    inject(SeoService).update({ title: 'Catalogue', path: '/catalogue' });
  }
}
