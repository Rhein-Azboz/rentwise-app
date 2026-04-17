// src/utils/formatCurrency.ts
export function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}