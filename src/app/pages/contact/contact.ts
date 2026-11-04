import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SeoService } from '../../services/seo.service';
import { IconComponent } from '../../components/icon/icon';

const CONTACT_EMAIL = 'contact@marketspace.cm';

@Component({
  selector: 'app-contact-page',
  imports: [FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page container">
      <header class="page-head">
        <h1>À propos et contact</h1>
        <p class="page-lead">
          MarketSpace met en relation les personnes qui souhaitent acheter ou vendre des articles de mode de seconde main au Cameroun.
        </p>
      </header>

      <div class="contact-layout">
        <section aria-labelledby="about-title">
          <h2 id="about-title">Une mode qui circule</h2>
          <p>
            Découvrez des pièces uniques — pagne, toghu, chaussures, sacs et accessoires — proposées par des vendeurs de Douala,
            Yaoundé et d'autres villes du Cameroun.
          </p>
          <ul class="check-list">
            <li><app-icon name="check" /> Parcourez les articles par catégorie, taille, état, prix ou ville.</li>
            <li><app-icon name="check" /> Échangez directement avec le vendeur pour convenir de la remise.</li>
            <li><app-icon name="check" /> Vérifiez l'article avant de finaliser le paiement avec le vendeur.</li>
          </ul>
          <p>
            MarketSpace est un catalogue de mise en relation : le paiement et la livraison ne sont pas traités sur ce site.
          </p>
          <address>
            <p><strong>Courriel :</strong> <a href="mailto:contact@marketspace.cm">contact&#64;marketspace.cm</a></p>
            <p><strong>Zone :</strong> Douala, Cameroun</p>
          </address>
        </section>

        <section class="contact-card" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">Écrivez-nous</h2>
          <p>Remplissez le formulaire : votre application de messagerie préparera ensuite le courriel.</p>

          <form class="form" #contactForm="ngForm" novalidate (ngSubmit)="submit(contactForm)">
            <div class="field">
              <label for="contact-name">Nom <span class="required" aria-hidden="true">*</span></label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autocomplete="name"
                required
                minlength="2"
                maxlength="100"
                [(ngModel)]="name"
                #nameField="ngModel"
                [attr.aria-invalid]="nameField.invalid && (nameField.touched || submitted()) ? 'true' : null"
                [attr.aria-describedby]="nameField.invalid && (nameField.touched || submitted()) ? 'name-error' : null"
              />
              @if (nameField.invalid && (nameField.touched || submitted())) {
                <p class="field-error" id="name-error">
                  {{ nameField.errors?.['required'] ? 'Veuillez saisir votre nom.' : 'Le nom doit contenir au moins 2 caractères.' }}
                </p>
              }
            </div>

            <div class="field">
              <label for="contact-email">Adresse e-mail <span class="required" aria-hidden="true">*</span></label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autocomplete="email"
                required
                maxlength="254"
                [(ngModel)]="email"
                #emailField="ngModel"
                [attr.aria-invalid]="emailField.invalid && (emailField.touched || submitted()) ? 'true' : null"
                [attr.aria-describedby]="emailField.invalid && (emailField.touched || submitted()) ? 'email-error' : null"
              />
              @if (emailField.invalid && (emailField.touched || submitted())) {
                <p class="field-error" id="email-error">
                  {{ emailField.errors?.['required'] ? 'Veuillez saisir votre adresse e-mail.' : 'Veuillez saisir une adresse e-mail valide.' }}
                </p>
              }
            </div>

            <div class="field">
              <label for="contact-message">Votre message <span class="required" aria-hidden="true">*</span></label>
              <textarea
                id="contact-message"
                name="message"
                required
                minlength="10"
                maxlength="3000"
                [(ngModel)]="message"
                #messageField="ngModel"
                [attr.aria-invalid]="messageField.invalid && (messageField.touched || submitted()) ? 'true' : null"
                [attr.aria-describedby]="messageField.invalid && (messageField.touched || submitted()) ? 'message-error' : null"
              ></textarea>
              @if (messageField.invalid && (messageField.touched || submitted())) {
                <p class="field-error" id="message-error">
                  {{ messageField.errors?.['required'] ? 'Veuillez saisir votre message.' : 'Le message doit contenir au moins 10 caractères.' }}
                </p>
              }
            </div>

            <button type="submit" class="btn btn-primary">Préparer le courriel</button>
          </form>

          @if (submitted() && !mailLink()) {
            <p class="notice notice-error" role="alert">Vérifiez les champs signalés avant de continuer.</p>
          }
          @if (mailLink(); as link) {
            <p class="notice" role="status">
              Votre message est prêt. Cliquez ci-dessous pour l'ouvrir dans votre application de messagerie.
            </p>
            <a class="btn btn-secondary btn-block" [href]="link">
              <app-icon name="mail" /> Ouvrir mon application de messagerie
            </a>
          }
        </section>
      </div>
    </section>
  `,
})
export class ContactPage {
  protected name = '';
  protected email = '';
  protected message = '';
  protected readonly submitted = signal(false);
  protected readonly mailLink = signal<string | null>(null);

  constructor() {
    inject(SeoService).update({
      title: 'À propos et contact',
      description: 'En savoir plus sur MarketSpace, marketplace de mode de seconde main au Cameroun, et contacter notre équipe.',
      path: '/contact',
    });
  }

  protected submit(form: NgForm): void {
    this.submitted.set(true);
    this.mailLink.set(null);
    if (form.invalid) return;

    const subject = encodeURIComponent(`Message MarketSpace de ${this.name.trim()}`);
    const body = encodeURIComponent(
      `Nom : ${this.name.trim()}\nE-mail : ${this.email.trim()}\n\n${this.message.trim()}`,
    );
    this.mailLink.set(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`);
  }
}
