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
  drawsPerDay?: number;
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
      middayNumbers?: string;
      eveningNumbers?: string;
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
  retiredDate?: string; // ISO date (YYYY-MM-DD) when the game was retired, e.g., '2026-02-21' for Cash4Life
}

export interface DrawResult {
  date: string;
  numbers: number[];
  bonusNumber: number | null;
  multiplier?: number;
  jackpot?: string;
  drawTime?: 'midday' | 'evening';
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

export interface TripletFrequency {
  triplet: [number, number, number];
  count: number;
  percentage: number;
}

export interface QuadrupletFrequency {
  quadruplet: [number, number, number, number];
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
  bonusNumber: number | null;
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

export type LotterySlug = 'powerball' | 'mega-millions' | 'cash4life' | 'ny-lotto' | 'take5' | 'millionaire-for-life';

export interface NumberSet {
  id: string;
  name: string;
  game: LotterySlug;
  numbers: number[];
  bonusNumber?: number;
  customNote?: string;
  startDate?: string;
  createdAt: string;
}

export interface WhatIfResult {
  totalWinnings: number;
  totalDrawsChecked: number;
  tiers: PrizeTierResult[];
  bestDraw: { date: string; matched: number; bonusMatch: boolean; prize: number } | null;
  matchTimeline: { date: string; matched: number; bonusMatch: boolean; prize: number }[];
}

export interface PrizeTierResult {
  label: string;
  mainMatches: number;
  bonusMatch: boolean;
  prize: number | string;
  count: number;
  totalWon: number;
}

export interface PatternAnalysis {
  sum: number;
  avgWinningSum: number;
  oddCount: number;
  evenCount: number;
  highCount: number;
  lowCount: number;
  primeCount: number;
  primes: number[];
  hasConsecutive: boolean;
  consecutivePairs: [number, number][];
  spread: number;
  min: number;
  max: number;
  hotColdOverlap: { hot: number[]; cold: number[] };
}

export interface CrossGameResult {
  game: LotterySlug;
  gameName: string;
  totalWinnings: number;
  totalDraws: number;
  compatible: boolean;
  incompatibleReason?: string;
}
