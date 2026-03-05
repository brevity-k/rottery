import { DrawResult, CrossGameResult, LotterySlug } from '@/lib/lotteries/types';
import { getAllLotteries } from '@/lib/lotteries/config';
import { analyzeWhatIf } from './whatIf';

export function analyzeCrossGame(
  userNumbers: number[],
  userBonus: number | undefined,
  drawsByGame: Record<string, DrawResult[]>,
  currentGame: LotterySlug
): CrossGameResult[] {
  const lotteries = getAllLotteries();
  const results: CrossGameResult[] = [];

  for (const lottery of lotteries) {
    const slug = lottery.slug as LotterySlug;
    const draws = drawsByGame[slug];
    if (!draws || draws.length === 0) continue;

    const maxMain = lottery.mainNumbers.max;
    const outOfRange = userNumbers.filter(n => n > maxMain);

    if (outOfRange.length > 0) {
      results.push({
        game: slug,
        gameName: lottery.name,
        totalWinnings: 0,
        totalDraws: draws.length,
        compatible: false,
        incompatibleReason: `Numbers ${outOfRange.join(', ')} exceed max (${maxMain})`,
      });
      continue;
    }

    if (userNumbers.length < lottery.mainNumbers.count && slug !== currentGame) {
      results.push({
        game: slug,
        gameName: lottery.name,
        totalWinnings: 0,
        totalDraws: draws.length,
        compatible: false,
        incompatibleReason: `Requires ${lottery.mainNumbers.count} numbers, you have ${userNumbers.length}`,
      });
      continue;
    }

    const numbersForGame = userNumbers.slice(0, lottery.mainNumbers.count);

    const bonusForGame = lottery.bonusNumber.count > 0 && userBonus != null && userBonus <= lottery.bonusNumber.max
      ? userBonus
      : undefined;

    const whatIf = analyzeWhatIf(numbersForGame, bonusForGame, draws, slug);

    results.push({
      game: slug,
      gameName: lottery.name,
      totalWinnings: whatIf.totalWinnings,
      totalDraws: whatIf.totalDrawsChecked,
      compatible: true,
    });
  }

  return results.sort((a, b) => b.totalWinnings - a.totalWinnings);
}
