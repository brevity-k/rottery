import { DrawResult, NumberFrequency } from '@/lib/lotteries/types';

export function calculateFrequency(
  draws: DrawResult[],
  maxNumber: number,
  type: 'main' | 'bonus' = 'main'
): NumberFrequency[] {
  const counts = new Map<number, { count: number; lastDrawn: string }>();

  // Initialize all numbers
  const max = type === 'main' ? maxNumber : maxNumber;
  for (let i = 1; i <= max; i++) {
    counts.set(i, { count: 0, lastDrawn: '' });
  }

  // Count occurrences
  for (const draw of draws) {
    const numbersToCheck = type === 'main' ? draw.numbers : [draw.bonusNumber];
    for (const num of numbersToCheck) {
      const existing = counts.get(num);
      if (existing) {
        existing.count++;
        if (!existing.lastDrawn || draw.date > existing.lastDrawn) {
          existing.lastDrawn = draw.date;
        }
      }
    }
  }

  const totalDraws = draws.length;

  return Array.from(counts.entries()).map(([number, data]) => {
    const drawsSinceLastDrawn = data.lastDrawn
      ? draws.findIndex(d => {
          const nums = type === 'main' ? d.numbers : [d.bonusNumber];
          return nums.includes(number);
        })
      : totalDraws;

    return {
      number,
      count: data.count,
      percentage: totalDraws > 0 ? (data.count / totalDraws) * 100 : 0,
      lastDrawn: data.lastDrawn || 'Never',
      drawsSinceLastDrawn: drawsSinceLastDrawn === -1 ? totalDraws : drawsSinceLastDrawn,
    };
  }).sort((a, b) => b.count - a.count);
}

export function getTopFrequent(frequencies: NumberFrequency[], count: number): NumberFrequency[] {
  return frequencies.slice(0, count);
}

export function getLeastFrequent(frequencies: NumberFrequency[], count: number): NumberFrequency[] {
  return [...frequencies].sort((a, b) => a.count - b.count).slice(0, count);
}
