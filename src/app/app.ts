import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from './components/footer/footer';
import { HeaderComponent } from './components/header/header';
import { AnnouncerService } from './services/announcer.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly announcer = inject(AnnouncerService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private firstNavigation = true;
  private lastPath = '';

  constructor() {
    if (!this.isBrowser) return;

    // Accessibilité : après chaque changement de page, le focus revient sur <main>
    // et le lecteur d'écran annonce le nouveau titre (sauf au premier chargement).
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((event) => {
        // Seule la page compte : changer un filtre (?categorie=…) ne doit pas voler le focus
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        const samePage = path === this.lastPath;
        this.lastPath = path;
        if (this.firstNavigation) {
          this.firstNavigation = false;
          return;
        }
        if (samePage) return;
        setTimeout(() => {
          this.doc.getElementById('main')?.focus({ preventScroll: true });
          this.announcer.announce(this.title.getTitle());
        });
      });
  }

  /** Le lien d'évitement ne passe pas par l'URL (la balise <base href="/"> casserait « #main ») */
  protected skipToMain(): void {
    this.doc.getElementById('main')?.focus();
  }
}
