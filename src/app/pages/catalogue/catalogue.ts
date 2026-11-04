import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../components/icon/icon';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { APP_CONFIG, CONDITIONS } from '../../constants/app.constants';
import { Product } from '../../models';
import { AnnouncerService } from '../../services/announcer.service';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { formatPrice } from '../../utils/format';

export const SORTS = [
  { id: 'recent', label: 'Plus récents' },
  { id: 'prix-asc', label: 'Prix croissant' },
  { id: 'prix-desc', label: 'Prix décroissant' },
  { id: 'note', label: 'Mieux notés' },
] as const;
type SortId = (typeof SORTS)[number]['id'];

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'];

/** Tailles : lettres, puis pointures, puis âges des enfants */
function sizeRank(size: string): [number, number] {
  const letter = SIZE_ORDER.indexOf(size);
  if (letter >= 0) return [0, letter];
  const n = parseInt(size, 10);
  if (/ans?$/i.test(size)) return [2, n];
  return Number.isNaN(n) ? [3, 0] : [1, n];
}

/** « Épaule » → « epaule » : recherche insensible aux accents et à la casse */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function toPrice(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

@Component({
  selector: 'app-catalogue-page',
  imports: [IconComponent, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalogue.html',
})
export class CataloguePage {
  private readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly announcer = inject(AnnouncerService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Paramètres d'URL (?q=…&categorie=…) fournis par le routeur (withComponentInputBinding)
  readonly q = input<string>();
  readonly categorie = input<string>();
  readonly etat = input<string>();
  readonly taille = input<string>();
  readonly ville = input<string>();
  readonly prixmin = input<string>();
  readonly prixmax = input<string>();
  readonly tri = input<string>();

  protected readonly categories = this.data.categories;
  protected readonly conditions = CONDITIONS;
  protected readonly sorts = SORTS;
  protected readonly sizes = [...new Set(this.data.products.map((p) => p.size))].sort((a, b) => {
    const [ga, na] = sizeRank(a);
    const [gb, nb] = sizeRank(b);
    return ga - gb || na - nb || a.localeCompare(b);
  });
  protected readonly cities = [...new Set(this.data.products.map((p) => p.city))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  );

  /** Filtres validés : une valeur inconnue dans l'URL est simplement ignorée */
  protected readonly state = computed(() => {
    const category = this.categories.find((c) => c.slug === this.categorie());
    const condition = CONDITIONS.find((c) => c.id === this.etat());
    let min = toPrice(this.prixmin());
    let max = toPrice(this.prixmax());
    if (min !== null && max !== null && min > max) [min, max] = [max, min];
    return {
      q: (this.q() ?? '').trim(),
      categorie: category?.slug ?? '',
      etat: condition?.id ?? '',
      taille: this.sizes.includes(this.taille() ?? '') ? (this.taille() as string) : '',
      ville: this.cities.includes(this.ville() ?? '') ? (this.ville() as string) : '',
      prixmin: min,
      prixmax: max,
      tri: (SORTS.some((s) => s.id === this.tri()) ? this.tri() : 'recent') as SortId,
    };
  });

  protected readonly category = computed(() =>
    this.categories.find((c) => c.slug === this.state().categorie),
  );

  /** Étiquettes des filtres actifs, chacune avec les paramètres à retirer */
  protected readonly activeFilters = computed(() => {
    const s = this.state();
    const list: { label: string; keys: string[] }[] = [];
    if (s.q) list.push({ label: `Recherche : « ${s.q} »`, keys: ['q'] });
    if (s.categorie) list.push({ label: this.category()?.name ?? s.categorie, keys: ['categorie'] });
    if (s.etat) {
      const label = CONDITIONS.find((c) => c.id === s.etat)?.label ?? s.etat;
      list.push({ label, keys: ['etat'] });
    }
    if (s.taille) list.push({ label: `Taille ${s.taille}`, keys: ['taille'] });
    if (s.ville) list.push({ label: s.ville, keys: ['ville'] });
    if (s.prixmin !== null && s.prixmax !== null) {
      list.push({
        label: `${formatPrice(s.prixmin)} à ${formatPrice(s.prixmax)}`,
        keys: ['prixmin', 'prixmax'],
      });
    } else if (s.prixmin !== null) {
      list.push({ label: `Dès ${formatPrice(s.prixmin)}`, keys: ['prixmin'] });
    } else if (s.prixmax !== null) {
      list.push({ label: `Jusqu'à ${formatPrice(s.prixmax)}`, keys: ['prixmax'] });
    }
    return list;
  });

  /** Texte de recherche préparé une seule fois par article */
  private readonly haystacks = new Map<string, string>(
    this.data.products.map((p) => [
      p.id,
      normalize(
        [p.title, p.description, p.city, p.size, this.data.getCategoryById(p.category)?.name].join(' '),
      ),
    ]),
  );

  protected readonly results = computed<Product[]>(() => {
    const s = this.state();
    const words = normalize(s.q).split(/\s+/).filter(Boolean);
    const list = this.data.products.filter(
      (p) =>
        (!s.categorie || p.category === s.categorie) &&
        (!s.etat || p.condition === s.etat) &&
        (!s.taille || p.size === s.taille) &&
        (!s.ville || p.city === s.ville) &&
        (s.prixmin === null || p.price >= s.prixmin) &&
        (s.prixmax === null || p.price <= s.prixmax) &&
        words.every((w) => this.haystacks.get(p.id)?.includes(w)),
    );
    const byRecent = (a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt);
    switch (s.tri) {
      case 'prix-asc':
        return list.sort((a, b) => a.price - b.price || byRecent(a, b));
      case 'prix-desc':
        return list.sort((a, b) => b.price - a.price || byRecent(a, b));
      case 'note':
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || byRecent(a, b));
      default:
        return list.sort(byRecent);
    }
  });

  /** Revient à une page quand les filtres changent ; « Charger plus » l'agrandit */
  private readonly visibleCount = linkedSignal<Product[], number>({
    source: this.results,
    computation: () => APP_CONFIG.pageSize,
  });
  protected readonly shown = computed(() => this.results().slice(0, this.visibleCount()));
  protected readonly hasMore = computed(() => this.visibleCount() < this.results().length);

  protected readonly filtersOpen = signal(false);

  private firstRun = true;

  constructor() {
    effect(() => {
      const s = this.state();
      const cat = this.category();
      const filtered = this.activeFilters().length > 0;
      this.seo.update({
        title: cat ? `${cat.name} de seconde main` : 'Catalogue',
        description: cat
          ? `${cat.description} Prix en FCFA, partout au Cameroun.`
          : 'Tous les articles de seconde main : filtrez par catégorie, taille, ville, état et prix.',
        path: s.categorie && this.activeFilters().length === 1 ? `/catalogue?categorie=${s.categorie}` : '/catalogue',
        // Les combinaisons de filtres ne sont pas à indexer (contenu quasi dupliqué)
        noindex: filtered && !(s.categorie && this.activeFilters().length === 1),
      });
    });

    // Les lecteurs d'écran sont prévenus du nombre de résultats après chaque changement de filtre
    effect(() => {
      const n = this.results().length;
      if (this.firstRun || !this.isBrowser) {
        this.firstRun = false;
        return;
      }
      this.announcer.announce(n === 0 ? 'Aucun article trouvé' : `${n} article${n > 1 ? 's' : ''} trouvé${n > 1 ? 's' : ''}`);
    });
  }

  protected toggleFilters(): void {
    this.filtersOpen.update((open) => !open);
  }

  /** Lit le formulaire (filtres + tri) et met à jour l'URL */
  protected apply(form: HTMLFormElement): void {
    const fd = new FormData(form);
    const get = (key: string) => String(fd.get(key) ?? '').trim();
    this.go({
      q: get('q'),
      categorie: get('categorie'),
      etat: get('etat'),
      taille: get('taille'),
      ville: get('ville'),
      prixmin: get('prixmin'),
      prixmax: get('prixmax'),
      tri: get('tri') === 'recent' ? '' : get('tri'),
    });
  }

  protected removeFilter(keys: string[]): void {
    const s = this.state();
    const params: Record<string, string> = {
      q: s.q,
      categorie: s.categorie,
      etat: s.etat,
      taille: s.taille,
      ville: s.ville,
      prixmin: s.prixmin === null ? '' : String(s.prixmin),
      prixmax: s.prixmax === null ? '' : String(s.prixmax),
      tri: s.tri === 'recent' ? '' : s.tri,
    };
    for (const key of keys) params[key] = '';
    this.go(params);
  }

  protected reset(): void {
    this.go({});
  }

  protected loadMore(): void {
    const before = this.shown().length;
    this.visibleCount.update((n) => n + APP_CONFIG.pageSize);
    const total = this.results().length;
    this.announcer.announce(`${Math.min(this.visibleCount(), total)} articles affichés sur ${total}`);
    // Le focus passe au premier nouvel article, sinon il serait perdu avec le bouton
    setTimeout(() => {
      this.host.nativeElement
        .querySelectorAll<HTMLElement>('.product-grid .card-title a')
        [before]?.focus();
    });
  }

  private go(params: Record<string, string>): void {
    const queryParams: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(params)) queryParams[key] = value || null;
    this.router.navigate(['/catalogue'], { queryParams });
  }
}
