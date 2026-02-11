import { Metadata } from 'next';
import { LotteryConfig } from '@/lib/lotteries/types';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/utils/constants';

export function generateLotteryMetadata(
  lottery: LotteryConfig,
  page: 'overview' | 'numbers' | 'results' | 'statistics',
  extra?: { year?: string }
): Metadata {
  const titles: Record<string, string> = {
    overview: `${lottery.name} Results, Numbers & Statistics | ${SITE_NAME}`,
    numbers: `${lottery.name} Number Recommendations - AI-Powered Insights | ${SITE_NAME}`,
    results: extra?.year
      ? `${lottery.name} Results ${extra.year} | ${SITE_NAME}`
      : `${lottery.name} Past Results & Winning Numbers | ${SITE_NAME}`,
    statistics: `${lottery.name} Statistics & Frequency Analysis | ${SITE_NAME}`,
  };

  const descriptions: Record<string, string> = {
    overview: `Latest ${lottery.name} results, winning numbers, and draw information. Get AI-powered number insights and statistical analysis.`,
    numbers: `Get statistically-analyzed ${lottery.name} number recommendations. Our analysis engine examines frequency trends, hot/cold patterns, and overdue numbers.`,
    results: extra?.year
      ? `Complete ${lottery.name} winning numbers and results for ${extra.year}. Browse all draw results with statistical breakdowns.`
      : `Browse complete ${lottery.name} past results and winning numbers history. Search by date and view detailed draw information.`,
    statistics: `Detailed ${lottery.name} statistics including number frequency, hot/cold analysis, overdue numbers, and pair frequency data.`,
  };

  const url = page === 'overview'
    ? `${SITE_URL}/${lottery.slug}`
    : `${SITE_URL}/${lottery.slug}/${page}${extra?.year ? `/${extra.year}` : ''}`;

  return {
    title: titles[page],
    description: descriptions[page],
    openGraph: {
      title: titles[page],
      description: descriptions[page],
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[page],
      description: descriptions[page],
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateHomeMetadata(): Metadata {
  return {
    title: `${SITE_NAME} - AI-Powered Lottery Number Insights & Statistics`,
    description: SITE_DESCRIPTION + '. Get number recommendations, results, and statistics for Powerball, Mega Millions, and more US lotteries.',
    openGraph: {
      title: `${SITE_NAME} - AI-Powered Lottery Number Insights & Statistics`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} - AI-Powered Lottery Number Insights & Statistics`,
      description: SITE_DESCRIPTION,
    },
  };
}

export function generateBlogMetadata(title: string, description: string, slug: string): Metadata {
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/blog/${slug}`,
      siteName: SITE_NAME,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
  };
}
