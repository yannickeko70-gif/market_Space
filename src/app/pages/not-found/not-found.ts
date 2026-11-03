import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container not-found">
      <p class="not-found-code" aria-hidden="true">404</p>
      <h1>Page introuvable</h1>
      <p class="muted">
        Cette page n'existe pas ou n'existe plus. L'article a peut-être été vendu.
      </p>
      <div class="not-found-actions">
        <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
        <a routerLink="/catalogue" class="btn btn-secondary">Voir le catalogue</a>
      </div>
    </section>
  `,
})
export class NotFoundPage {
  constructor() {
    inject(SeoService).update({ title: 'Page introuvable', noindex: true });
  }
}
