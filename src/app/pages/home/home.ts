import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../services/seo.service';

/** Page provisoire : le contenu réel arrive à l'étape 4 */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page container">
      <h1>Mode de seconde main au Cameroun</h1>
      <p class="page-lead">Cette page sera construite à l'étape 4.</p>
    </section>
  `,
})
export class HomePage {
  constructor() {
    inject(SeoService).update({ title: 'Mode de seconde main au Cameroun', path: '/' });
  }
}
