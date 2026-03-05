'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WhatIfResult } from '@/lib/lotteries/types';
import Card from '@/components/ui/Card';

interface Props {
  timeline: WhatIfResult['matchTimeline'];
}

export default function MatchTimeline({ timeline }: Props) {
  if (timeline.length === 0) return null;

  const chartData = timeline.map(entry => ({
    date: entry.date,
    matches: entry.matched + (entry.bonusMatch ? 0.5 : 0),
    prize: entry.prize,
    label: `${entry.matched}${entry.bonusMatch ? '+B' : ''}`,
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Timeline</h3>
      <p className="text-sm text-gray-600 mb-4">
        Every draw where your numbers matched at least one winning number.
      </p>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="matches"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={{ r: 2, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
