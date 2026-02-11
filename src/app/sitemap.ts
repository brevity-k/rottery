import { MetadataRoute } from 'next';
import { getAllLotteries } from '@/lib/lotteries/config';
import { getAllBlogSlugs } from '@/lib/blog';
import { SITE_URL } from '@/lib/utils/constants';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lotteries = getAllLotteries();
  const blogSlugs = getAllBlogSlugs();
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/tools/number-generator`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/tools/odds-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const lotteryPages: MetadataRoute.Sitemap = lotteries.flatMap(lottery => [
    { url: `${SITE_URL}/${lottery.slug}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/${lottery.slug}/numbers`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${SITE_URL}/${lottery.slug}/results`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${SITE_URL}/${lottery.slug}/statistics`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
  ]);

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map(slug => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...lotteryPages, ...blogPages];
}
