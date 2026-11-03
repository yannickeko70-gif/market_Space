const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** 12500 → « 12 500 FCFA » */
export function formatPrice(amount: number): string {
  return `${nombre.format(amount)}\u00A0FCFA`;
}