import { DrawResult, HotColdNumber } from '@/lib/lotteries/types';

export function calculateHotCold(
  draws: DrawResult[],
  maxNumber: number,
  type: 'main' | 'bonus' = 'main'
): HotColdNumber[] {
  const recentDraws = draws.slice(0, 20);
  const mediumDraws = draws.slice(0, 100);
  const allDraws = draws;

  const results: HotColdNumber[] = [];
  const max = maxNumber;

  for (let num = 1; num <= max; num++) {
    const recentCount = countOccurrences(recentDraws, num, type);
    const mediumCount = countOccurrences(mediumDraws, num, type);
    const allTimeCount = countOccurrences(allDraws, num, type);

    // Weighted score: recent 3x, medium 2x, all-time 1x
    const score = (recentCount * 3) + (mediumCount * 2) + (allTimeCount * 1);

    results.push({
      number: num,
      score,
      recentCount,
      mediumCount,
      allTimeCount,
      classification: 'warm', // will be set below
    });
  }

  // Sort by score and classify
  results.sort((a, b) => b.score - a.score);
  const third = Math.floor(results.length / 3);

  results.forEach((r, i) => {
    if (i < third) r.classification = 'hot';
    else if (i < third * 2) r.classification = 'warm';
    else r.classification = 'cold';
  });

  return results;
}

function countOccurrences(draws: DrawResult[], number: number, type: 'main' | 'bonus'): number {
  return draws.filter(d => {
    const nums = type === 'main' ? d.numbers : [d.bonusNumber];
    return nums.includes(number);
  }).length;
}

export function getHotNumbers(hotCold: HotColdNumber[], count: number): HotColdNumber[] {
  return hotCold.filter(n => n.classification === 'hot').slice(0, count);
}

export function getColdNumbers(hotCold: HotColdNumber[], count: number): HotColdNumber[] {
  return [...hotCold].reverse().filter(n => n.classification === 'cold').slice(0, count);
}
