import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APP_CONFIG, getCondition } from '../constants/app.constants';
import { Product, Review, Seller } from '../models';

export interface SeoData {
  title: string;
  description?: string;
  /** Chemin de la page, ex. « /catalogue » */
  path?: string;
  image?: string;
  type?: 'website' | 'product';
  noindex?: boolean;
  /** Blocs schema.org supplémentaires (produit, fil d'Ariane…) */
  jsonLd?: object[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  private readonly baseGraph: object[] = [
    {
      '@type': 'Organization',
      '@id': `${APP_CONFIG.siteUrl}/#organization`,
      name: APP_CONFIG.siteName,
      url: `${APP_CONFIG.siteUrl}/`,
      logo: `${APP_CONFIG.siteUrl}/assets/icons/icon-512.png`,
      areaServed: 'CM',
    },
    {
      '@type': 'WebSite',
      '@id': `${APP_CONFIG.siteUrl}/#website`,
      name: APP_CONFIG.siteName,
      url: `${APP_CONFIG.siteUrl}/`,
      inLanguage: 'fr-CM',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${APP_CONFIG.siteUrl}/catalogue?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  update(data: SeoData): void {
    const fullTitle = data.title.includes(APP_CONFIG.siteName)
      ? data.title
      : `${data.title} – ${APP_CONFIG.siteName}`;
    const description = data.description ?? APP_CONFIG.defaultDescription;
    const url = APP_CONFIG.siteUrl + (data.path ?? '/');
    const image = data.image ?? APP_CONFIG.defaultImage;

    this.titleService.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'robots',
      content: data.noindex ? 'noindex, follow' : 'index, follow',
    });

    this.meta.updateTag({ property: 'og:type', content: data.type ?? 'website' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
    this.setJsonLd([...this.baseGraph, ...(data.jsonLd ?? [])]);
  }

  /** Bloc schema.org Product avec offre, état et avis agrégés */
  buildProductSchema(product: Product, seller: Seller | undefined, reviews: Review[]): object {
    const url = `${APP_CONFIG.siteUrl}/produit/${product.slug}`;
    const schema: Record<string, unknown> = {
      '@type': 'Product',
      '@id': `${url}#product`,
      name: product.title,
      description: product.description,
      image: product.images.map((img) => `${APP_CONFIG.siteUrl}/${img.src}`),
      category: product.category,
      size: product.size,
      itemCondition: getCondition(product.condition).schema,
      offers: {
        '@type': 'Offer',
        url,
        price: product.price,
        priceCurrency: product.currency,
        availability: 'https://schema.org/InStock',
        ...(seller ? { seller: { '@type': 'Organization', name: seller.name } } : {}),
      },
    };
    if (reviews.length > 0) {
      const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      schema['aggregateRating'] = {
        '@type': 'AggregateRating',
        ratingValue: Math.round(average * 10) / 10,
        reviewCount: reviews.length,
      };
    }
    return schema;
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(graph: object[]): void {
    let script = this.doc.getElementById('ld-json');
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'ld-json';
      script.setAttribute('type', 'application/ld+json');
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }
}