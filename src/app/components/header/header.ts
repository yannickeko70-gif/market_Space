import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { ThemeService } from '../../services/theme.service';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  protected readonly cart = inject(CartService);
  protected readonly favorites = inject(FavoritesService);
  protected readonly theme = inject(ThemeService);

  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/catalogue', label: 'Catalogue', exact: false },
    { path: '/contact', label: 'Contact', exact: false },
  ];

  constructor() {
    // Le menu mobile se referme après chaque navigation
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  search(event: Event, query: string): void {
    event.preventDefault();
    const q = query.trim();
    this.router.navigate(['/catalogue'], { queryParams: q ? { q } : {} });
  }
}
