import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../components/icon/icon';
import { PictureComponent } from '../../components/picture/picture';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { RatingComponent } from '../../components/rating/rating';
import { Category, Review, Seller } from '../../models';
import { DataService } from '../../services/data.service';
import { SeoService } from '../../services/seo.service';
import { formatDate } from '../../utils/format';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, IconComponent, PictureComponent, ProductCardComponent, RatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class HomePage {
  protected readonly data = inject(DataService);
  private readonly router = inject(Router);

  protected readonly categories = this.data.categories;
  protected readonly latest = this.data.getLatestProducts(8);
  protected readonly productCount = this.data.products.length;
  protected readonly sellerCount = this.data.sellers.length;
  protected readonly recentReviews = this.data.reviews.slice(0, 3);

  protected readonly steps = [
    { icon: 'search', title: '1. Parcourez', text: 'Cherchez par catégorie, taille, ville ou état de l’article.' },
    { icon: 'chat', title: '2. Contactez', text: 'Échangez avec le vendeur pour convenir du prix et de la remise en main propre.' },
    { icon: 'check', title: '3. Recevez', text: 'Payez à la livraison, après avoir vérifié l’article.' },
  ];

  constructor() {
    inject(SeoService).update({
      title: 'Mode de seconde main au Cameroun',
      description:
        'Achetez et vendez des vêtements, chaussures et accessoires de seconde main partout au Cameroun. Prix en FCFA.',
      path: '/',
    });
  }

  /** « icon-dress » (clé du JSON) → « dress » (nom de l'icône) */
  protected iconOf(category: Category): string {
    return category.icon.replace(/^icon-/, '');
  }

  protected categoryCount(category: Category): number {
    return this.data.products.filter((p) => p.category === category.id).length;
  }

  protected sellerRating(seller: Seller): { average: number; count: number } {
    return this.data.summarizeRatings(this.data.getReviewsBySeller(seller.id));
  }

  protected sellerProductCount(seller: Seller): number {
    return this.data.getProductsBySeller(seller.id).length;
  }

  protected productOf(review: Review) {
    return this.data.getProductById(review.productId);
  }

  protected date(iso: string): string {
    return formatDate(iso);
  }

  protected search(event: Event, query: string): void {
    event.preventDefault();
    const q = query.trim();
    this.router.navigate(['/catalogue'], { queryParams: q ? { q } : {} });
  }
}
