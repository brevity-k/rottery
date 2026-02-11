import { DrawResult, RecommendedSet, StrategyType, LotteryConfig } from '@/lib/lotteries/types';
import { strategies } from '@/lib/lotteries/config';
import { calculateFrequency } from './frequency';
import { calculateHotCold } from './hotCold';
import { calculateOverdue } from './overdue';
import { calculatePairs } from './pairs';

interface NumberScore {
  number: number;
  score: number;
  reasons: string[];
}

export function generateRecommendations(
  draws: DrawResult[],
  config: LotteryConfig,
  strategy: StrategyType = 'balanced',
  count: number = 3
): RecommendedSet[] {
  const strategyConfig = strategies[strategy];
  const { weights } = strategyConfig;

  const mainFreq = calculateFrequency(draws, config.mainNumbers.max, 'main');
  const mainHotCold = calculateHotCold(draws, config.mainNumbers.max, 'main');
  const mainOverdue = calculateOverdue(draws, config.mainNumbers.max, 'main');
  const pairs = calculatePairs(draws);

  const bonusFreq = calculateFrequency(draws, config.bonusNumber.max, 'bonus');
  const bonusHotCold = calculateHotCold(draws, config.bonusNumber.max, 'bonus');
  const bonusOverdue = calculateOverdue(draws, config.bonusNumber.max, 'bonus');

  // Score each main number
  const mainScores: NumberScore[] = [];
  for (let num = 1; num <= config.mainNumbers.max; num++) {
    const freq = mainFreq.find(f => f.number === num);
    const hot = mainHotCold.find(h => h.number === num);
    const overdue = mainOverdue.find(o => o.number === num);

    const reasons: string[] = [];
    let score = 0;

    if (freq) {
      const freqRank = mainFreq.indexOf(freq) / mainFreq.length;
      const freqScore = (1 - freqRank) * weights.frequency;
      score += freqScore;
      if (freqRank < 0.2) reasons.push(`Top ${Math.round(freqRank * 100 + 1)}% most frequent`);
    }

    if (hot) {
      const hotRank = mainHotCold.indexOf(hot) / mainHotCold.length;
      const hotScore = (1 - hotRank) * weights.hot;
      score += hotScore;
      if (hot.classification === 'hot') reasons.push('Currently trending hot');
    }

    if (overdue) {
      const overdueScore = Math.min(overdue.overdueRatio / 3, 1) * weights.overdue;
      score += overdueScore;
      if (overdue.overdueRatio > 1.5) reasons.push(`Overdue by ${Math.round(overdue.overdueRatio * 100)}%`);
    }

    // Pair bonus
    const pairBonus = pairs
      .filter(p => p.pair.includes(num))
      .reduce((sum, p) => sum + p.percentage, 0) / 100;
    score += Math.min(pairBonus, 1) * weights.pairs;

    mainScores.push({ number: num, score, reasons });
  }

  // Score bonus numbers
  const bonusScores: NumberScore[] = [];
  for (let num = 1; num <= config.bonusNumber.max; num++) {
    const freq = bonusFreq.find(f => f.number === num);
    const hot = bonusHotCold.find(h => h.number === num);
    const overdue = bonusOverdue.find(o => o.number === num);

    const reasons: string[] = [];
    let score = 0;

    if (freq) {
      const freqRank = bonusFreq.indexOf(freq) / bonusFreq.length;
      score += (1 - freqRank) * weights.frequency;
      if (freqRank < 0.2) reasons.push('Frequently drawn bonus');
    }
    if (hot) {
      const hotRank = bonusHotCold.indexOf(hot) / bonusHotCold.length;
      score += (1 - hotRank) * weights.hot;
    }
    if (overdue) {
      score += Math.min(overdue.overdueRatio / 3, 1) * weights.overdue;
    }

    bonusScores.push({ number: num, score, reasons });
  }

  mainScores.sort((a, b) => b.score - a.score);
  bonusScores.sort((a, b) => b.score - a.score);

  // Generate multiple sets
  const sets: RecommendedSet[] = [];
  for (let i = 0; i < count; i++) {
    const offset = i * 2;
    const selectedMain = selectNumbers(mainScores, config.mainNumbers.count, offset);
    const selectedBonus = bonusScores[i % bonusScores.length];

    const reasoning = selectedMain
      .flatMap(s => s.reasons)
      .filter(Boolean)
      .slice(0, 4);

    if (reasoning.length === 0) {
      reasoning.push(`Selected using ${strategyConfig.name.toLowerCase()} strategy analysis`);
    }

    sets.push({
      numbers: selectedMain.map(s => s.number).sort((a, b) => a - b),
      bonusNumber: selectedBonus.number,
      strategy: strategyConfig.name,
      reasoning,
      confidence: Math.round((selectedMain.reduce((sum, s) => sum + s.score, 0) / selectedMain.length) * 100),
    });
  }

  return sets;
}

function selectNumbers(scores: NumberScore[], count: number, offset: number): NumberScore[] {
  // Take top candidates with some variation based on offset
  const pool = scores.slice(0, count * 3 + offset);
  const selected: NumberScore[] = [];
  const used = new Set<number>();

  for (let i = offset; i < pool.length && selected.length < count; i++) {
    if (!used.has(pool[i].number)) {
      selected.push(pool[i]);
      used.add(pool[i].number);
    }
  }

  // Fill remaining from top if needed
  for (let i = 0; i < pool.length && selected.length < count; i++) {
    if (!used.has(pool[i].number)) {
      selected.push(pool[i]);
      used.add(pool[i].number);
    }
  }

  return selected;
}
