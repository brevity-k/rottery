import { LotteryConfig, DrawResult } from '@/lib/lotteries/types';

/**
 * Parses raw SODA API response objects into DrawResult[].
 */
export function parseSodaResponse(rawData: any[], config: LotteryConfig): DrawResult[] {
  const mainCount = config.mainNumbers.count;
  const draws: DrawResult[] = [];

  for (const entry of rawData) {
    const parsed = parseEntry(entry, mainCount);
    if (parsed) {
      draws.push(parsed);
    }
  }

  draws.sort((a, b) => b.date.localeCompare(a.date));
  return draws;
}

function parseEntry(entry: any, mainCount: number): DrawResult | null {
  if (!entry.draw_date || !entry.winning_numbers) return null;

  const date = parseDate(entry.draw_date);
  if (!date) return null;

  const numbersStr = entry.winning_numbers.trim();
  const allNumbers = numbersStr.split(/\s+/).map(Number);
  if (allNumbers.some(isNaN)) return null;

  let numbers: number[];
  let bonusNumber: number;

  if (entry.mega_ball) {
    // Mega Millions: bonus in separate field
    if (allNumbers.length < mainCount) return null;
    numbers = allNumbers.slice(0, mainCount);
    bonusNumber = Number(entry.mega_ball);
    if (isNaN(bonusNumber)) return null;
  } else {
    // Powerball: bonus is the last number in winning_numbers
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
