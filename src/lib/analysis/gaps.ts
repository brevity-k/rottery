import { DrawResult, GapAnalysis } from '@/lib/lotteries/types';

export function calculateGaps(
  draws: DrawResult[],
  maxNumber: number,
  type: 'main' | 'bonus' = 'main'
): GapAnalysis[] {
  const results: GapAnalysis[] = [];
  const max = maxNumber;

  for (let num = 1; num <= max; num++) {
    const appearances: number[] = [];

    for (let i = 0; i < draws.length; i++) {
      const nums = type === 'main' ? draws[i].numbers : [draws[i].bonusNumber];
      if (nums.includes(num)) {
        appearances.push(i);
      }
    }

    if (appearances.length < 2) {
      results.push({
        number: num,
        minGap: 0,
        maxGap: 0,
        avgGap: 0,
        currentGap: appearances.length === 0 ? draws.length : appearances[0],
      });
      continue;
    }

    const gaps: number[] = [];
    for (let i = 1; i < appearances.length; i++) {
      gaps.push(appearances[i] - appearances[i - 1]);
    }

    results.push({
      number: num,
      minGap: Math.min(...gaps),
      maxGap: Math.max(...gaps),
      avgGap: Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 100) / 100,
      currentGap: appearances[0],
    });
  }

  return results.sort((a, b) => b.currentGap - a.currentGap);
}
