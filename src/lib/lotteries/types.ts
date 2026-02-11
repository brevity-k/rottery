export interface LotteryConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  mainNumbers: {
    count: number;
    max: number;
    label: string;
  };
  bonusNumber: {
    count: number;
    max: number;
    label: string;
  };
  drawDays: string[];
  drawTime: string;
  ticketPrice: number;
  jackpotOdds: string;
  dataSource: {
    type: 'soda' | 'csv';
    url: string;
    fields: {
      date: string;
      numbers: string;
      bonus: string;
      multiplier?: string;
      jackpot?: string;
    };
  };
  colors: {
    primary: string;
    secondary: string;
    ball: string;
    bonusBall: string;
  };
  logo?: string;
  website: string;
  startYear: number;
}

export interface DrawResult {
  date: string;
  numbers: number[];
  bonusNumber: number;
  multiplier?: number;
  jackpot?: string;
}

export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  lastDrawn: string;
  drawsSinceLastDrawn: number;
}

export interface HotColdNumber {
  number: number;
  score: number;
  recentCount: number;
  mediumCount: number;
  allTimeCount: number;
  classification: 'hot' | 'warm' | 'cold';
}

export interface OverdueNumber {
  number: number;
  drawsSinceLastDrawn: number;
  expectedInterval: number;
  overdueRatio: number;
}

export interface PairFrequency {
  pair: [number, number];
  count: number;
  percentage: number;
}

export interface GapAnalysis {
  number: number;
  minGap: number;
  maxGap: number;
  avgGap: number;
  currentGap: number;
}

export interface RecommendedSet {
  numbers: number[];
  bonusNumber: number;
  strategy: string;
  reasoning: string[];
  confidence: number;
}

export interface LotteryData {
  lottery: string;
  lastUpdated: string;
  draws: DrawResult[];
}

export type StrategyType = 'balanced' | 'trending' | 'contrarian';

export interface StrategyConfig {
  name: string;
  description: string;
  weights: {
    frequency: number;
    hot: number;
    overdue: number;
    pairs: number;
  };
}
