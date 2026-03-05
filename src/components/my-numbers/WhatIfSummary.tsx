'use client';

import { WhatIfResult } from '@/lib/lotteries/types';
import Card from '@/components/ui/Card';

interface Props {
  result: WhatIfResult;
  setName: string;
  gameName: string;
  startDate?: string;
}

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toLocaleString()}`;
}

export default function WhatIfSummary({ result, setName, gameName, startDate }: Props) {
  const winDraws = result.matchTimeline.length;
  const winRate = result.totalDrawsChecked > 0
    ? ((winDraws / result.totalDrawsChecked) * 100).toFixed(1)
    : '0';

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">What-If Summary</h3>
      <p className="text-sm text-gray-600 mb-4">
        If you had played <span className="font-semibold">&ldquo;{setName}&rdquo;</span> in every {gameName} draw
        {startDate ? ` since ${startDate}` : ''} ({result.totalDrawsChecked.toLocaleString()} draws):
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-700">{formatMoney(result.totalWinnings)}</p>
          <p className="text-xs text-green-600">Total Winnings</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-700">{winDraws}</p>
          <p className="text-xs text-blue-600">Winning Draws</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-700">{winRate}%</p>
          <p className="text-xs text-purple-600">Win Rate</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <p className="text-2xl font-bold text-amber-700">
            {result.bestDraw ? formatMoney(result.bestDraw.prize) : '-'}
          </p>
          <p className="text-xs text-amber-600">
            Best Draw{result.bestDraw ? ` (${result.bestDraw.date})` : ''}
          </p>
        </div>
      </div>
    </Card>
  );
}
