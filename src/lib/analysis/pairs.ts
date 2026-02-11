import { DrawResult, PairFrequency } from '@/lib/lotteries/types';

export function calculatePairs(
  draws: DrawResult[],
  topCount: number = 20
): PairFrequency[] {
  const pairCounts = new Map<string, number>();
  const totalDraws = draws.length;

  for (const draw of draws) {
    const nums = [...draw.numbers].sort((a, b) => a - b);

    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]}-${nums[j]}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
  }

  const results: PairFrequency[] = Array.from(pairCounts.entries())
    .map(([key, count]) => {
      const [a, b] = key.split('-').map(Number);
      return {
        pair: [a, b] as [number, number],
        count,
        percentage: totalDraws > 0 ? (count / totalDraws) * 100 : 0,
      };
    })
    .sort((a, b) => b.count - a.count);

  return results.slice(0, topCount);
}
