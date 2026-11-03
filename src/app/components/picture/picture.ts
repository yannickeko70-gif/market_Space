import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Image responsive : AVIF puis WebP puis JPEG, avec plusieurs largeurs.
 * Le fichier de référence est celui de la plus grande largeur (« …-800.jpg »),
 * les autres variantes s'en déduisent (« …-400.avif », « …-400.webp », etc.).
 */
@Component({
  selector: 'app-picture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // L'élément hôte disparaît de la mise en page : <picture> reste l'enfant direct du conteneur
  styles: `
    :host {
      display: contents;
    }
  `,
  template: `
    <picture>
      <source type="image/avif" [attr.srcset]="srcset('avif')" [attr.sizes]="sizes()" />
      <source type="image/webp" [attr.srcset]="srcset('webp')" [attr.sizes]="sizes()" />
      <img
        [src]="'/' + src()"
        [attr.srcset]="srcset('jpg')"
        [attr.sizes]="sizes()"
        [alt]="alt()"
        [attr.width]="width()"
        [attr.height]="height()"
        [attr.loading]="priority() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="priority() ? 'high' : null"
        decoding="async"
      />
    </picture>
  `,
})
export class PictureComponent {
  /** Chemin de l'image de référence, ex. « assets/img/products/p01-a-800.jpg » */
  readonly src = input.required<string>();
  /** Texte alternatif (chaîne vide si l'image est purement décorative) */
  readonly alt = input.required<string>();
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  /** Largeurs disponibles, ex. [400, 800] */
  readonly widths = input<readonly number[]>([400, 800]);
  /** Largeur d'affichage, pour que le navigateur choisisse le bon fichier */
  readonly sizes = input<string>('100vw');
  /** Image au-dessus de la ligne de flottaison (LCP) : chargée tout de suite */
  readonly priority = input(false);

  private readonly base = computed(() => this.src().replace(/-\d+\.(jpe?g|png)$/i, ''));

  protected srcset(ext: 'avif' | 'webp' | 'jpg'): string {
    return this.widths()
      .map((w) => `/${this.base()}-${w}.${ext} ${w}w`)
      .join(', ');
  }
}
