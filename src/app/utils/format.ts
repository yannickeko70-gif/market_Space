const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** 12500 → « 12 500 FCFA » */
export function formatPrice(amount: number): string {
  return `${nombre.format(amount)}\u00A0FCFA`;
}

const dateLongue = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

/** « 2026-10-30 » → « 30 octobre 2026 » */
export function formatDate(isoDate: string): string {
  return dateLongue.format(new Date(isoDate));
}

/** 4.5 → « 4,5 » */
export function formatRating(value: number): string {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
