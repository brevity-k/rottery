import { DrawResult, OverdueNumber } from '@/lib/lotteries/types';

export function calculateOverdue(
  draws: DrawResult[],
  maxNumber: number,
  type: 'main' | 'bonus' = 'main'
): OverdueNumber[] {
  const results: OverdueNumber[] = [];
  const totalDraws = draws.length;
  const max = maxNumber;

  for (let num = 1; num <= max; num++) {
    let drawsSinceLastDrawn = 0;
    let totalAppearances = 0;

    for (let i = 0; i < draws.length; i++) {
      const nums = type === 'main' ? draws[i].numbers : [draws[i].bonusNumber];
      if (nums.includes(num)) {
        if (totalAppearances === 0) {
          drawsSinceLastDrawn = i;
        }
        totalAppearances++;
      }
    }

    if (totalAppearances === 0) {
      drawsSinceLastDrawn = totalDraws;
    }

    const expectedInterval = totalAppearances > 0
      ? totalDraws / totalAppearances
      : totalDraws;

    results.push({
      number: num,
      drawsSinceLastDrawn,
      expectedInterval: Math.round(expectedInterval * 100) / 100,
      overdueRatio: expectedInterval > 0
        ? Math.round((drawsSinceLastDrawn / expectedInterval) * 100) / 100
        : 0,
    });
  }

  return results.sort((a, b) => b.overdueRatio - a.overdueRatio);
}

export function getMostOverdue(overdue: OverdueNumber[], count: number): OverdueNumber[] {
  return overdue.slice(0, count);
}
