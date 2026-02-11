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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{config.mainNumbers.label}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{config.bonusNumber.label}</th>
            {config.dataSource.fields.multiplier && (
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Multiplier</th>
            )}
          </tr>
        </thead>
        <tbody>
          {displayDraws.map((draw, index) => (
            <tr key={draw.date + index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(draw.date)}</td>
              <td className="py-3 px-4">
                <div className="flex gap-1.5">
                  {draw.numbers.map((num, i) => (
                    <LotteryBall key={i} number={num} type="main" size="sm" />
                  ))}
                </div>
              </td>
              <td className="py-3 px-4">
                <LotteryBall number={draw.bonusNumber} type="bonus" size="sm" />
              </td>
              {config.dataSource.fields.multiplier && (
                <td className="py-3 px-4 text-sm text-gray-700">{draw.multiplier ? `${draw.multiplier}x` : '-'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
