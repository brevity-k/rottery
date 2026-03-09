import { Metadata } from 'next';
import { LotteryConfig } from '@/lib/lotteries/types';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';

const year = new Date().getFullYear();

export function generateLotteryMetadata(
  lottery: LotteryConfig,
  page: 'overview' | 'numbers' | 'results' | 'statistics',
  extra?: { year?: string }
): Metadata {
  const titles: Record<string, string> = {
    overview: `${lottery.name} Results Today - Winning Numbers ${year}`,
    numbers: `${lottery.name} Number Recommendations - AI Analysis`,
    results: extra?.year
      ? `${lottery.name} Results ${extra.year} - Past Winning Numbers`
      : `${lottery.name} Winning Numbers History - All Results`,
    statistics: `${lottery.name} Statistics - Hot & Cold Numbers ${year}`,
  };

  const descriptions: Record<string, string> = {
    overview: `Latest ${lottery.name} winning numbers updated daily. Check results, see hot & cold number trends, and get AI-powered number recommendations. Free.`,
    numbers: `Get ${lottery.name} number recommendations based on frequency, hot/cold trends, and overdue patterns. Three AI strategies to choose from. Updated daily.`,
    results: extra?.year
      ? `All ${lottery.name} winning numbers from ${extra.year}. Complete draw-by-draw results with every number.`
      : `Complete ${lottery.name} results history. Every winning number from ${lottery.startYear} to today. Updated after every draw.`,
    statistics: `${lottery.name} number frequency, hot/cold analysis, overdue numbers, and common pairs. Free statistical tools updated after every draw.`,
  };

  const url = page === 'overview'
    ? `${SITE_URL}/${lottery.slug}`
    : `${SITE_URL}/${lottery.slug}/${page}${extra?.year ? `/${extra.year}` : ''}`;

  return {
    title: { absolute: titles[page] },
    description: descriptions[page],
    openGraph: {
      title: titles[page],
      description: descriptions[page],
      url,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateHomeMetadata(): Metadata {
  const title = `Lottery Statistics & Results ${year} - Free Number Analysis`;
  const description = 'Free lottery statistics for Powerball, Mega Millions, and more. Check results, analyze hot & cold numbers, and try our What-If simulator. Updated daily.';
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL,
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}
