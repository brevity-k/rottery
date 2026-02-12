import { LotteryConfig, DrawResult } from '@/lib/lotteries/types';

/**
 * Parses raw SODA API response objects into DrawResult[].
 * Handles various game formats:
 * - Powerball: bonus is last number in winning_numbers
 * - Mega Millions: bonus in separate mega_ball field
 * - Cash4Life: bonus in separate cash_ball field
 * - NY Lotto: bonus in separate bonus field
 * - Take 5: no bonus, midday/evening draws in separate fields
 */
export function parseSodaResponse(rawData: Record<string, string>[], config: LotteryConfig): DrawResult[] {
  const draws: DrawResult[] = [];

  for (const entry of rawData) {
    const parsed = parseEntry(entry, config);
    if (parsed) {
      if (Array.isArray(parsed)) {
        draws.push(...parsed);
      } else {
        draws.push(parsed);
      }
    }
  }

  draws.sort((a, b) => b.date.localeCompare(a.date));
  return draws;
}

function parseEntry(entry: Record<string, string>, config: LotteryConfig): DrawResult | DrawResult[] | null {
  if (!entry.draw_date) return null;

  const date = parseDate(entry.draw_date);
  if (!date) return null;

  const mainCount = config.mainNumbers.count;
  const hasBonus = config.bonusNumber.count > 0;
  const bonusField = config.dataSource.fields.bonus;
  const middayField = config.dataSource.fields.middayNumbers;
  const eveningField = config.dataSource.fields.eveningNumbers;

  // Take 5-style: midday and evening draws in separate fields
  if (middayField && eveningField) {
    const results: DrawResult[] = [];

    const middayStr = entry[middayField];
    if (middayStr && typeof middayStr === 'string') {
      const middayNums = middayStr.trim().split(/\s+/).map(Number);
      if (middayNums.length >= mainCount && !middayNums.some(isNaN)) {
        results.push({
          date,
          numbers: middayNums.slice(0, mainCount),
          bonusNumber: null,
          drawTime: 'midday',
        });
      }
    }

    const eveningStr = entry[eveningField];
    if (eveningStr && typeof eveningStr === 'string') {
      const eveningNums = eveningStr.trim().split(/\s+/).map(Number);
      if (eveningNums.length >= mainCount && !eveningNums.some(isNaN)) {
        results.push({
          date,
          numbers: eveningNums.slice(0, mainCount),
          bonusNumber: null,
          drawTime: 'evening',
        });
      }
    }

    return results.length > 0 ? results : null;
  }

  // Standard: single winning_numbers field
  if (!entry.winning_numbers) return null;

  const numbersStr = entry.winning_numbers.trim();
  const allNumbers = numbersStr.split(/\s+/).map(Number);
  if (allNumbers.some(isNaN)) return null;

  let numbers: number[];
  let bonusNumber: number | null;

  if (!hasBonus) {
    // No bonus number (e.g., Take 5 with single draw field)
    if (allNumbers.length < mainCount) return null;
    numbers = allNumbers.slice(0, mainCount);
    bonusNumber = null;
  } else if (bonusField && bonusField !== 'winning_numbers' && entry[bonusField] !== undefined) {
    // Bonus in separate field (Mega Millions, Cash4Life, NY Lotto)
    if (allNumbers.length < mainCount) return null;
    numbers = allNumbers.slice(0, mainCount);
    bonusNumber = Number(entry[bonusField]);
    if (isNaN(bonusNumber)) return null;
  } else {
    // Bonus is the last number in winning_numbers (Powerball)
    if (allNumbers.length < mainCount + 1) return null;
    numbers = allNumbers.slice(0, mainCount);
    bonusNumber = allNumbers[mainCount];
  }

  const multiplier = entry.multiplier ? Number(entry.multiplier) : undefined;

  const result: DrawResult = { date, numbers, bonusNumber };
  if (multiplier && !isNaN(multiplier)) result.multiplier = multiplier;

  return result;
}

function parseDate(dateStr: string): string | null {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}
