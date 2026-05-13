import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'THB', compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `฿${(value / 1_000).toFixed(0)}k`;
    return `฿${value.toFixed(0)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDelta(value: number, unit: 'pct' | 'pp' | 'abs' = 'pct'): string {
  const sign = value > 0 ? '+' : '';
  if (unit === 'pct') return `${sign}${value.toFixed(1)}%`;
  if (unit === 'pp') return `${sign}${value.toFixed(1)}pp`;
  return `${sign}${value.toLocaleString()}`;
}
