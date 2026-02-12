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
    description: 'Mega Millions is one of America\'s biggest lottery games, available in 45 states plus D.C. and the U.S. Virgin Islands. Since April 2025, players choose 5 numbers from 1-70 and 1 Mega Ball from 1-24. Tickets cost $5 with an automatic multiplier.',
    mainNumbers: { count: 5, max: 70, label: 'White Balls' },
    bonusNumber: { count: 1, max: 24, label: 'Mega Ball' },
    drawDays: ['Tuesday', 'Friday'],
    drawTime: '11:00 PM ET',
    ticketPrice: 5,
    jackpotOdds: '1 in 290,472,336',
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
  cash4life: {
    id: 'cash4life',
    name: 'Cash4Life',
    slug: 'cash4life',
    description: 'Cash4Life offers a top prize of $1,000 a day for life. Players choose 5 numbers from 1-60 and 1 Cash Ball from 1-4. Drawings are held daily at 9:00 PM ET.',
    mainNumbers: { count: 5, max: 60, label: 'Numbers' },
    bonusNumber: { count: 1, max: 4, label: 'Cash Ball' },
    drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    drawTime: '9:00 PM ET',
    ticketPrice: 2,
    jackpotOdds: '1 in 21,846,048',
    dataSource: {
      type: 'soda',
      url: 'https://data.ny.gov/resource/kwxv-fwze.json',
      fields: {
        date: 'draw_date',
        numbers: 'winning_numbers',
        bonus: 'cash_ball',
      },
    },
    colors: {
      primary: '#00a651',
      secondary: '#ffffff',
      ball: '#ffffff',
      bonusBall: '#00a651',
    },
    website: 'https://nylottery.ny.gov/cash4life',
    startYear: 2014,
    retiredDate: '2026-02-21',
  },
  'ny-lotto': {
    id: 'ny-lotto',
    name: 'NY Lotto',
    slug: 'ny-lotto',
    description: 'NY Lotto is New York\'s flagship lottery game. Players choose 6 numbers from 1-59 plus a bonus number. Drawings are held Wednesday and Saturday at 8:15 PM ET.',
    mainNumbers: { count: 6, max: 59, label: 'Numbers' },
    bonusNumber: { count: 1, max: 59, label: 'Bonus' },
    drawDays: ['Wednesday', 'Saturday'],
    drawTime: '8:15 PM ET',
    ticketPrice: 1,
    jackpotOdds: '1 in 45,057,474',
    dataSource: {
      type: 'soda',
      url: 'https://data.ny.gov/resource/6nbc-h7bj.json',
      fields: {
        date: 'draw_date',
        numbers: 'winning_numbers',
        bonus: 'bonus',
      },
    },
    colors: {
      primary: '#7b2d8e',
      secondary: '#ffd700',
      ball: '#ffffff',
      bonusBall: '#ffd700',
    },
    website: 'https://nylottery.ny.gov/lotto',
    startYear: 2001,
  },
  take5: {
    id: 'take5',
    name: 'Take 5',
    slug: 'take5',
    description: 'Take 5 is a New York daily game with drawings twice a day. Players choose 5 numbers from 1-39. There is no bonus number. Midday drawing at 2:30 PM and evening drawing at 10:30 PM ET.',
    mainNumbers: { count: 5, max: 39, label: 'Numbers' },
    bonusNumber: { count: 0, max: 0, label: '' },
    drawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    drawTime: '2:30 PM & 10:30 PM ET',
    drawsPerDay: 2,
    ticketPrice: 1,
    jackpotOdds: '1 in 575,757',
    dataSource: {
      type: 'soda',
      url: 'https://data.ny.gov/resource/dg63-4siq.json',
      fields: {
        date: 'draw_date',
        numbers: 'winning_numbers',
        bonus: '',
        middayNumbers: 'midday_winning_numbers',
        eveningNumbers: 'evening_winning_numbers',
      },
    },
    colors: {
      primary: '#e87722',
      secondary: '#ffffff',
      ball: '#ffffff',
      bonusBall: '#e87722',
    },
    website: 'https://nylottery.ny.gov/take5',
    startYear: 2001,
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
