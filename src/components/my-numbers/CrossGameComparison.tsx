'use client';

import { CrossGameResult, LotterySlug } from '@/lib/lotteries/types';
import Card from '@/components/ui/Card';

interface Props {
  results: CrossGameResult[];
  currentGame: LotterySlug;
}

export default function CrossGameComparison({ results, currentGame }: Props) {
  const compatible = results.filter(r => r.compatible);

  if (compatible.length <= 1) return null;

  const incompatible = results.filter(r => !r.compatible);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Game Comparison</h3>
      <p className="text-sm text-gray-600 mb-4">
        How would your numbers perform in other lottery games?
      </p>

      <div className="space-y-2">
        {compatible.map((r, i) => (
          <div
            key={r.game}
            className={`flex items-center justify-between p-3 rounded-lg ${
              r.game === currentGame ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            }`}
          >
            <div>
              <span className="font-medium text-gray-900">{r.gameName}</span>
              {r.game === currentGame && (
                <span className="ml-2 text-xs text-blue-600">(your game)</span>
              )}
              <p className="text-xs text-gray-500">{r.totalDraws.toLocaleString()} draws</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">${r.totalWinnings.toLocaleString()}</p>
              {i === 0 && r.game !== currentGame && (
                <p className="text-xs text-green-600">Best fit</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {incompatible.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          <p>Not compatible: {incompatible.map(r => `${r.gameName} (${r.incompatibleReason})`).join(', ')}</p>
        </div>
      )}
    </Card>
  );
}
