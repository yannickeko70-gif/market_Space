import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatRating } from '../../utils/format';
import { IconComponent } from '../icon/icon';

/** Note sur 5 : étoiles décoratives + texte lu par les lecteurs d'écran */
@Component({
  selector: 'app-rating',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rating' },
  template: `
    <span class="rating-stars" aria-hidden="true">
      @for (full of stars(); track $index) {
        <app-icon name="star" [class.is-full]="full" />
      }
    </span>
    <span class="visually-hidden">Note : {{ label() }} sur 5</span>
    <span class="rating-value" aria-hidden="true">
      {{ label() }}@if (count() !== null) { ({{ count() }}) }
    </span>
  `,
})
export class RatingComponent {
  readonly value = input.required<number>();
  /** Nombre d'avis (facultatif) */
  readonly count = input<number | null>(null);

  protected readonly label = computed(() => formatRating(this.value()));
  protected readonly stars = computed(() => {
    const filled = Math.round(this.value());
    return [0, 1, 2, 3, 4].map((i) => i < filled);
  });
}
