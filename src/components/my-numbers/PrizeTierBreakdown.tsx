'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PrizeTierResult } from '@/lib/lotteries/types';
import Card from '@/components/ui/Card';

interface Props {
  tiers: PrizeTierResult[];
}

export default function PrizeTierBreakdown({ tiers }: Props) {
  const activeTiers = tiers.filter(t => t.count > 0);
  const chartData = activeTiers.map(t => ({
    tier: t.label,
    count: t.count,
    total: t.totalWon,
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Prize Tier Breakdown</h3>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-gray-600 font-medium">Tier</th>
              <th className="text-right py-2 px-4 text-gray-600 font-medium">Times Won</th>
              <th className="text-right py-2 pl-4 text-gray-600 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map(tier => (
              <tr key={tier.label} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-900">{tier.label}</td>
                <td className="text-right py-2 px-4 text-gray-700">{tier.count.toLocaleString()}</td>
                <td className="text-right py-2 pl-4 font-medium text-gray-900">
                  ${tier.totalWon.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chartData.length > 0 && (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tier" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'Total Won']}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
