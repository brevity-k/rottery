'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HotColdNumber } from '@/lib/lotteries/types';

interface HotColdChartProps {
  data: HotColdNumber[];
  limit?: number;
}

export default function HotColdChart({ data, limit = 30 }: HotColdChartProps) {
  const chartData = data.slice(0, limit).map(d => ({
    number: d.number.toString(),
    score: d.score,
    classification: d.classification,
  }));

  const getColor = (classification: string) => {
    switch (classification) {
      case 'hot': return '#ef4444';
      case 'warm': return '#f59e0b';
      case 'cold': return '#3b82f6';
      default: return '#9ca3af';
    }
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="number" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '0', 'Score']}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.classification)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
