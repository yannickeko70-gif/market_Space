import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Tracés SVG des icônes (viewBox 24×24, style « trait », hérité de currentColor) */
const ICONS: Record<string, readonly string[]> = {
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  search: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'm21 21-4.3-4.3'],
  bag: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
  heart: [
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  ],
  sun: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M12 2v2',
    'M12 20v2',
    'm4.93 4.93 1.41 1.41',
    'm17.66 17.66 1.41 1.41',
    'M2 12h2',
    'M20 12h2',
    'm6.34 17.66-1.41 1.41',
    'm19.07 4.93-1.41 1.41',
  ],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm22 7-10 7L2 7'],
  pin: ['M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  arrow: ['M5 12h14', 'm12 5 7 7-7 7'],
  star: ['m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  chat: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
  check: ['M20 6 9 17l-5-5'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 12 2 2 4-4'],
  shirt: [
    'M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z',
  ],
  dress: ['M9 2h6l1 5-2 3 4 12H6l4-12-2-3z'],
  shoe: ['M3 16v-5l4-1 3 3h4c4 0 7 1 7 3v1H3z', 'M3 20h18'],
  glasses: [
    'M6 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M18 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    'M14 15a2 2 0 0 0-4 0',
    'M2.5 13 5 7c.7-1.3 1.4-2 3-2',
    'M21.5 13 19 7c-.7-1.3-1.5-2-3-2',
  ],
  child: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M8 14s1.5 2 4 2 4-2 4-2', 'M9 9h.01', 'M15 9h.01'],
};

export type IconName = keyof typeof ICONS;

/** Icône décorative : le sens est toujours porté par le texte ou l'aria-label du parent */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" focusable="false">
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  protected readonly paths = computed(() => ICONS[this.name()] ?? []);
}
