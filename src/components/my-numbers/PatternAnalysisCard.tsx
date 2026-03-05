'use client';

import { PatternAnalysis } from '@/lib/lotteries/types';
import Card from '@/components/ui/Card';

interface Props {
  analysis: PatternAnalysis;
  customNote?: string;
}

function Badge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`px-3 py-2 rounded-lg ${color}`}>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function PatternAnalysisCard({ analysis, customNote }: Props) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Number Patterns</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <Badge label="Sum" value={`${analysis.sum} (avg: ${analysis.avgWinningSum})`} color="bg-gray-50" />
        <Badge label="Odd / Even" value={`${analysis.oddCount} / ${analysis.evenCount}`} color="bg-gray-50" />
        <Badge label="High / Low" value={`${analysis.highCount} / ${analysis.lowCount}`} color="bg-gray-50" />
        <Badge label="Prime Numbers" value={analysis.primes.length > 0 ? analysis.primes.join(', ') : 'None'} color="bg-gray-50" />
        <Badge label="Range" value={`${analysis.min} — ${analysis.max} (spread: ${analysis.spread})`} color="bg-gray-50" />
        <Badge label="Consecutive" value={analysis.hasConsecutive ? analysis.consecutivePairs.map(p => p.join('-')).join(', ') : 'None'} color="bg-gray-50" />
      </div>

      {(analysis.hotColdOverlap.hot.length > 0 || analysis.hotColdOverlap.cold.length > 0) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            {analysis.hotColdOverlap.hot.length > 0 && (
              <><span className="text-red-600 font-medium">Hot:</span> {analysis.hotColdOverlap.hot.join(', ')} &nbsp;</>
            )}
            {analysis.hotColdOverlap.cold.length > 0 && (
              <><span className="text-blue-600 font-medium">Cold:</span> {analysis.hotColdOverlap.cold.join(', ')}</>
            )}
          </p>
        </div>
      )}

      {customNote && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-600 font-medium mb-1">Your Rationale</p>
          <p className="text-sm text-gray-800">{customNote}</p>
        </div>
      )}
    </Card>
  );
}
