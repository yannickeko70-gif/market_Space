import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page container not-found">
      <div class="not-found-panel">
        <div class="not-found-illustration" aria-hidden="true">
          <span class="not-found-code">404</span>
          <span class="not-found-symbol"><app-icon name="search" /></span>
        </div>

        <div class="not-found-content">
          <p class="not-found-label">Erreur 404</p>
          <h1>Cette page a disparu</h1>
          <p class="not-found-description">
            Le lien a peut-être changé ou l’article a déjà trouvé preneur. Vous pouvez repartir du début
            ou explorer les articles disponibles.
          </p>
          <div class="not-found-actions">
            <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
            <a routerLink="/catalogue" class="btn btn-secondary">Explorer le catalogue</a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class NotFoundPage {
  constructor() {
    inject(SeoService).update({ title: 'Page introuvable', noindex: true });
  }
}
