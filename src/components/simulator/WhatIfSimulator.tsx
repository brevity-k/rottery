'use client';

import { SimulatorLotteryConfig } from '@/app/simulator/page';
import { DrawResult } from '@/lib/lotteries/types';

interface WhatIfSimulatorProps {
  lotteries: SimulatorLotteryConfig[];
  drawsByGame: Record<string, DrawResult[]>;
}

export default function WhatIfSimulator({ lotteries, drawsByGame }: WhatIfSimulatorProps) {
  return <div>Simulator placeholder</div>;
}
