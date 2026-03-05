import { LotterySlug } from './types';

export interface PrizeTier {
  label: string;
  mainMatches: number;
  bonusMatch: boolean;
  prize: number;
}

export const prizeTables: Record<LotterySlug, PrizeTier[]> = {
  powerball: [
    { label: '5 + Powerball', mainMatches: 5, bonusMatch: true, prize: 20_000_000 },
    { label: '5', mainMatches: 5, bonusMatch: false, prize: 1_000_000 },
    { label: '4 + Powerball', mainMatches: 4, bonusMatch: true, prize: 50_000 },
    { label: '4', mainMatches: 4, bonusMatch: false, prize: 100 },
    { label: '3 + Powerball', mainMatches: 3, bonusMatch: true, prize: 100 },
    { label: '3', mainMatches: 3, bonusMatch: false, prize: 7 },
    { label: '2 + Powerball', mainMatches: 2, bonusMatch: true, prize: 7 },
    { label: '1 + Powerball', mainMatches: 1, bonusMatch: true, prize: 4 },
    { label: '0 + Powerball', mainMatches: 0, bonusMatch: true, prize: 4 },
  ],
  'mega-millions': [
    { label: '5 + Mega Ball', mainMatches: 5, bonusMatch: true, prize: 20_000_000 },
    { label: '5', mainMatches: 5, bonusMatch: false, prize: 1_000_000 },
    { label: '4 + Mega Ball', mainMatches: 4, bonusMatch: true, prize: 10_000 },
    { label: '4', mainMatches: 4, bonusMatch: false, prize: 500 },
    { label: '3 + Mega Ball', mainMatches: 3, bonusMatch: true, prize: 200 },
    { label: '3', mainMatches: 3, bonusMatch: false, prize: 10 },
    { label: '2 + Mega Ball', mainMatches: 2, bonusMatch: true, prize: 10 },
    { label: '1 + Mega Ball', mainMatches: 1, bonusMatch: true, prize: 4 },
    { label: '0 + Mega Ball', mainMatches: 0, bonusMatch: true, prize: 2 },
  ],
  cash4life: [
    { label: '5 + Cash Ball', mainMatches: 5, bonusMatch: true, prize: 7_000_000 },
    { label: '5', mainMatches: 5, bonusMatch: false, prize: 1_000_000 },
    { label: '4 + Cash Ball', mainMatches: 4, bonusMatch: true, prize: 2_500 },
    { label: '4', mainMatches: 4, bonusMatch: false, prize: 500 },
    { label: '3 + Cash Ball', mainMatches: 3, bonusMatch: true, prize: 100 },
    { label: '3', mainMatches: 3, bonusMatch: false, prize: 25 },
    { label: '2 + Cash Ball', mainMatches: 2, bonusMatch: true, prize: 10 },
    { label: '2', mainMatches: 2, bonusMatch: false, prize: 4 },
    { label: '1 + Cash Ball', mainMatches: 1, bonusMatch: true, prize: 2 },
  ],
  'ny-lotto': [
    { label: '6 Numbers', mainMatches: 6, bonusMatch: false, prize: 5_000_000 },
    { label: '5 + Bonus', mainMatches: 5, bonusMatch: true, prize: 50_000 },
    { label: '5', mainMatches: 5, bonusMatch: false, prize: 1_000 },
    { label: '4', mainMatches: 4, bonusMatch: false, prize: 50 },
    { label: '3', mainMatches: 3, bonusMatch: false, prize: 1 },
  ],
  take5: [
    { label: '5 Numbers', mainMatches: 5, bonusMatch: false, prize: 50_000 },
    { label: '4', mainMatches: 4, bonusMatch: false, prize: 500 },
    { label: '3', mainMatches: 3, bonusMatch: false, prize: 25 },
    { label: '2', mainMatches: 2, bonusMatch: false, prize: 1 },
  ],
  'millionaire-for-life': [
    { label: '5 + Millionaire Ball', mainMatches: 5, bonusMatch: true, prize: 20_000_000 },
    { label: '5', mainMatches: 5, bonusMatch: false, prize: 1_000_000 },
    { label: '4 + Millionaire Ball', mainMatches: 4, bonusMatch: true, prize: 5_000 },
    { label: '4', mainMatches: 4, bonusMatch: false, prize: 200 },
    { label: '3 + Millionaire Ball', mainMatches: 3, bonusMatch: true, prize: 50 },
    { label: '3', mainMatches: 3, bonusMatch: false, prize: 10 },
    { label: '2 + Millionaire Ball', mainMatches: 2, bonusMatch: true, prize: 5 },
    { label: '1 + Millionaire Ball', mainMatches: 1, bonusMatch: true, prize: 2 },
    { label: '0 + Millionaire Ball', mainMatches: 0, bonusMatch: true, prize: 2 },
  ],
};
