import { DrawResult } from '@/lib/lotteries/types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Formats a YYYY-MM-DD date string to a human-readable format.
 * Example: "2024-01-15" -> "January 15, 2024"
 */
export function formatDate(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(monthIndex) || isNaN(day)) {
    return dateStr;
  }

  const monthName = MONTH_NAMES[monthIndex];
  if (!monthName) {
    return dateStr;
  }

  return `${monthName} ${day}, ${year}`;
}

/**
 * Pads a number to 2 digits with a leading zero.
 * Example: 5 -> "05", 12 -> "12"
 */
export function formatNumber(num: number): string {
  return String(num).padStart(2, '0');
}

/**
 * Formats a number as US currency.
 * Example: 1234567 -> "$1,234,567"
 */
export function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

/**
 * Formats a decimal value as a percentage string.
 * Example: 0.1234 with decimals=2 -> "12.34%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return value.toFixed(decimals) + '%';
}

/**
 * Returns the odds string as-is.
 * This is a pass-through for consistent formatting usage.
 */
export function formatOdds(odds: string): string {
  return odds;
}

/**
 * Formats an ISO date string to a short "Updated" format.
 * Example: "2026-02-11T06:00:00Z" -> "Updated Feb 11, 2026"
 */
export function formatLastUpdated(isoString: string): string {
  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = isoString.split('T')[0];
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(monthIndex) || isNaN(day) || !SHORT_MONTHS[monthIndex]) {
    return `Updated ${dateStr}`;
  }

  return `Updated ${SHORT_MONTHS[monthIndex]} ${day}, ${year}`;
}

/**
 * Estimates reading time from HTML content.
 * Strips tags, counts words, assumes 200 WPM.
 * Example: 800 words -> "4 min read"
 */
export function calculateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/**
 * Extracts an array of unique years from draw results, sorted descending.
 * Example: draws from 2020-2024 -> [2024, 2023, 2022, 2021, 2020]
 */
export function getYearsRange(draws: DrawResult[]): number[] {
  const yearsSet = new Set<number>();

  for (const draw of draws) {
    const year = parseInt(draw.date.substring(0, 4), 10);
    if (!isNaN(year)) {
      yearsSet.add(year);
    }
  }

  return Array.from(yearsSet).sort((a, b) => b - a);
}
