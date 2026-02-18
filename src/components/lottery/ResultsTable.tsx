import Link from 'next/link';
import { DrawResult, LotteryConfig } from '@/lib/lotteries/types';
import LotteryBall from './LotteryBall';
import { formatDate } from '@/lib/utils/formatters';

interface ResultsTableProps {
  draws: DrawResult[];
  config: LotteryConfig;
  limit?: number;
}

export default function ResultsTable({ draws, config, limit }: ResultsTableProps) {
  const displayDraws = limit ? draws.slice(0, limit) : draws;
  const hasBonus = config.bonusNumber.count > 0;
  const hasMultiplier = !!config.dataSource.fields.multiplier;
  const hasDrawTime = displayDraws.some(d => d.drawTime);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
            {hasDrawTime && (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Draw</th>
            )}
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{config.mainNumbers.label}</th>
            {hasBonus && (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{config.bonusNumber.label}</th>
            )}
            {hasMultiplier && (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Multiplier</th>
            )}
          </tr>
        </thead>
        <tbody>
          {displayDraws.map((draw, index) => (
            <tr key={draw.date + (draw.drawTime || '') + index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(draw.date)}</td>
              {hasDrawTime && (
                <td className="py-3 px-4 text-xs text-gray-500 capitalize">{draw.drawTime || '-'}</td>
              )}
              <td className="py-3 px-4">
                <div className="flex gap-1.5">
                  {draw.numbers.map((num, i) => (
                    <Link key={i} href={`/${config.slug}/numbers/main-${num}`} title={`View analysis for number ${num}`}>
                      <LotteryBall number={num} type="main" size="sm" />
                    </Link>
                  ))}
                </div>
              </td>
              {hasBonus && (
                <td className="py-3 px-4">
                  <Link href={`/${config.slug}/numbers/bonus-${draw.bonusNumber!}`} title={`View analysis for ${config.bonusNumber.label} ${draw.bonusNumber!}`}>
                    <LotteryBall number={draw.bonusNumber!} type="bonus" size="sm" color={config.colors.bonusBall} />
                  </Link>
                </td>
              )}
              {hasMultiplier && (
                <td className="py-3 px-4 text-sm text-gray-700">{draw.multiplier ? `${draw.multiplier}x` : '-'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
