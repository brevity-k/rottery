import { LotteryConfig, StrategyConfig, StrategyType } from './types';

export const lotteries: Record<string, LotteryConfig> = {
  powerball: {
    id: 'powerball',
    name: 'Powerball',
    slug: 'powerball',
    description: 'Powerball is a multi-state lottery game played across 45 states, Washington D.C., Puerto Rico, and the U.S. Virgin Islands. Players choose 5 numbers from 1-69 and 1 Powerball number from 1-26.',
    mainNumbers: { count: 5, max: 69, label: 'White Balls' },
    bonusNumber: { count: 1, max: 26, label: 'Powerball' },
    drawDays: ['Monday', 'Wednesday', 'Saturday'],
    drawTime: '10:59 PM ET',
    ticketPrice: 2,
    jackpotOdds: '1 in 292,201,338',
    dataSource: {
      type: 'soda',
      url: 'https://data.ny.gov/resource/d6yy-54nr.json',
      fields: {
        date: 'draw_date',
        numbers: 'winning_numbers',
        bonus: 'winning_numbers',
        multiplier: 'multiplier',
      },
    },
    colors: {
      primary: '#c8102e',
      secondary: '#ffffff',
      ball: '#ffffff',
      bonusBall: '#c8102e',
    },
    website: 'https://www.powerball.com',
    startYear: 2010,
  },
  'mega-millions': {
    id: 'mega-millions',
    name: 'Mega Millions',
    slug: 'mega-millions',
    description: 'Mega Millions is one of America\'s biggest lottery games, available in 45 states plus D.C. and the U.S. Virgin Islands. Players choose 5 numbers from 1-70 and 1 Mega Ball from 1-25.',
    mainNumbers: { count: 5, max: 70, label: 'White Balls' },
    bonusNumber: { count: 1, max: 25, label: 'Mega Ball' },
    drawDays: ['Tuesday', 'Friday'],
    drawTime: '11:00 PM ET',
    ticketPrice: 2,
    jackpotOdds: '1 in 302,575,350',
    dataSource: {
      type: 'soda',
      url: 'https://data.ny.gov/resource/5xaw-6ayf.json',
      fields: {
        date: 'draw_date',
        numbers: 'winning_numbers',
        bonus: 'winning_numbers',
        multiplier: 'mega_ball',
      },
    },
    colors: {
      primary: '#0b5394',
      secondary: '#ffd700',
      ball: '#ffffff',
      bonusBall: '#ffd700',
    },
    website: 'https://www.megamillions.com',
    startYear: 2002,
  },
};

export const strategies: Record<StrategyType, StrategyConfig> = {
  balanced: {
    name: 'Balanced',
    description: 'A well-rounded blend of frequency trends, momentum, and overdue numbers.',
    weights: { frequency: 0.3, hot: 0.3, overdue: 0.25, pairs: 0.15 },
  },
  trending: {
    name: 'Trending',
    description: 'Favors numbers showing strong recent momentum in recent draws.',
    weights: { frequency: 0.2, hot: 0.5, overdue: 0.15, pairs: 0.15 },
  },
  contrarian: {
    name: 'Contrarian',
    description: 'Targets statistically overdue numbers that are due for a comeback.',
    weights: { frequency: 0.15, hot: 0.1, overdue: 0.6, pairs: 0.15 },
  },
};

export function getLottery(slug: string): LotteryConfig | undefined {
  return lotteries[slug];
}

export function getAllLotteries(): LotteryConfig[] {
  return Object.values(lotteries);
}

export function getAllLotterySlugs(): string[] {
  return Object.keys(lotteries);
}
