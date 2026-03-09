import { MetadataRoute } from 'next';
import { getAllLotteries } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { getYearsRange } from '@/lib/utils/formatters';
import { getAllBlogPosts } from '@/lib/blog';
import { getAllStateSlugs } from '@/lib/states/config';
import { SITE_URL } from '@/lib/utils/constants';

export const dynamic = 'force-static';

function getDataLastUpdated(slug: string): string {
  try {
    const data = loadLotteryData(slug);
    return data.lastUpdated || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lotteries = getAllLotteries();
  const currentYear = new Date().getFullYear();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/tools/number-generator`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tools/odds-calculator`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tools/tax-calculator`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/tools/ticket-checker`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/states`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/methodology`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/simulator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ];

  // Lottery overview, numbers, results, statistics pages
  const lotteryPages: MetadataRoute.Sitemap = lotteries.flatMap(lottery => {
    const lastMod = getDataLastUpdated(lottery.slug);
    return [
      { url: `${SITE_URL}/${lottery.slug}`, lastModified: lastMod, changeFrequency: 'daily' as const, priority: 0.9 },
      { url: `${SITE_URL}/${lottery.slug}/numbers`, lastModified: lastMod, changeFrequency: 'daily' as const, priority: 0.8 },
      { url: `${SITE_URL}/${lottery.slug}/results`, lastModified: lastMod, changeFrequency: 'daily' as const, priority: 0.8 },
      { url: `${SITE_URL}/${lottery.slug}/statistics`, lastModified: lastMod, changeFrequency: 'daily' as const, priority: 0.8 },
    ];
  });

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // State hub pages
  const statePages: MetadataRoute.Sitemap = getAllStateSlugs().map(slug => ({
    url: `${SITE_URL}/states/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Year archive pages
  const resultPages: MetadataRoute.Sitemap = lotteries.flatMap(lottery => {
    try {
      const data = loadLotteryData(lottery.slug);
      const years = getYearsRange(data.draws);
      return years.map(year => ({
        url: `${SITE_URL}/${lottery.slug}/results/${year}`,
        lastModified: year === currentYear ? data.lastUpdated : `${year}-12-31T23:59:59.000Z`,
        changeFrequency: year === currentYear ? 'weekly' as const : 'yearly' as const,
        priority: year === currentYear ? 0.7 : 0.4,
      }));
    } catch {
      return [];
    }
  });

  // Per-number analysis pages
  const numberPages: MetadataRoute.Sitemap = lotteries.flatMap(lottery => {
    const lastMod = getDataLastUpdated(lottery.slug);
    const pages: MetadataRoute.Sitemap = [];
    for (let n = 1; n <= lottery.mainNumbers.max; n++) {
      pages.push({
        url: `${SITE_URL}/${lottery.slug}/numbers/main-${n}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
    if (lottery.bonusNumber.count > 0) {
      for (let n = 1; n <= lottery.bonusNumber.max; n++) {
        pages.push({
          url: `${SITE_URL}/${lottery.slug}/numbers/bonus-${n}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.5,
        });
      }
    }
    return pages;
  });

  return [...staticPages, ...lotteryPages, ...blogPages, ...statePages, ...resultPages, ...numberPages];
}
