import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLottery, getAllLotterySlugs } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { generateLotteryMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema, lotteryFaqs, datasetSchema } from '@/lib/seo/structuredData';
import { SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { formatLastUpdated } from '@/lib/utils/formatters';
import { getRelatedPosts } from '@/lib/blog-links';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ResultsTable from '@/components/lottery/ResultsTable';
import JsonLd from '@/components/seo/JsonLd';
import Card from '@/components/ui/Card';

export function generateStaticParams() {
  return getAllLotterySlugs().map(slug => ({ lottery: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lottery: string }> }) {
  const { lottery: slug } = await params;
  const lottery = getLottery(slug);
  if (!lottery) return {};
  return generateLotteryMetadata(lottery, 'overview');
}

export default async function LotteryPage({ params }: { params: Promise<{ lottery: string }> }) {
  const { lottery: slug } = await params;
  const lottery = getLottery(slug);
  if (!lottery) notFound();

  let draws: import('@/lib/lotteries/types').DrawResult[] = [];
  let lastUpdated = '';
  try {
    const data = loadLotteryData(slug);
    draws = data.draws;
    lastUpdated = data.lastUpdated;
  } catch {
    // Data not yet available
  }

  const faqs = lotteryFaqs(lottery);
  const relatedPosts = getRelatedPosts(slug, lottery.name, 3);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: lottery.name, url: `${SITE_URL}/${lottery.slug}` },
      ])} />
      <JsonLd data={faqSchema(faqs)} />
      {draws.length > 0 && (
        <JsonLd data={datasetSchema({
          name: `${lottery.name} Winning Numbers`,
          description: `Historical draw results and winning numbers for ${lottery.name}${lottery.bonusNumber.count > 0 ? `, including ${lottery.bonusNumber.label}` : ''}.`,
          url: `${SITE_URL}/${lottery.slug}`,
          recordCount: draws.length,
          dateRange: `${draws[draws.length - 1]?.date}/${draws[0]?.date}`,
        })} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: lottery.name }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {lottery.name} Results & Numbers
        </h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-2">
            {formatLastUpdated(lastUpdated)} · <a href={lottery.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Verify with {lottery.name} ↗</a>
          </p>
        )}
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">{lottery.description}</p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href={`/${slug}/numbers`} className="bg-blue-600 text-white rounded-xl p-6 text-center hover:bg-blue-700 transition-colors">
            <p className="font-bold text-lg mb-1">Number Insights</p>
            <p className="text-sm text-blue-100">AI-powered recommendations</p>
          </Link>
          <Link href={`/${slug}/results`} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:shadow-sm transition-all">
            <p className="font-bold text-lg mb-1 text-gray-900">Past Results</p>
            <p className="text-sm text-gray-500">Full drawing history</p>
          </Link>
          <Link href={`/${slug}/statistics`} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:shadow-sm transition-all">
            <p className="font-bold text-lg mb-1 text-gray-900">Statistics</p>
            <p className="text-sm text-gray-500">Frequency & analysis</p>
          </Link>
        </div>

        {/* Game Info */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Game Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Format</p>
              <p className="font-semibold">
                {lottery.bonusNumber.count > 0
                  ? `${lottery.mainNumbers.count}/${lottery.mainNumbers.max} + ${lottery.bonusNumber.count}/${lottery.bonusNumber.max}`
                  : `${lottery.mainNumbers.count}/${lottery.mainNumbers.max}`
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Draw Days</p>
              <p className="font-semibold">{lottery.drawDays.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Draw Time</p>
              <p className="font-semibold">{lottery.drawTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jackpot Odds</p>
              <p className="font-semibold">{lottery.jackpotOdds}</p>
            </div>
          </div>
        </Card>

        {/* Latest Results */}
        {draws.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Latest Results</h2>
              <Link href={`/${slug}/results`} className="text-sm text-blue-600 hover:underline">View All →</Link>
            </div>
            <ResultsTable draws={draws} config={lottery} limit={10} />
          </Card>
        )}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h2>
            <div className="space-y-3">
              {relatedPosts.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-semibold text-gray-900 text-sm">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{post.category} · {post.date}</p>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* FAQ */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-gray-500">{DISCLAIMER_TEXT}</p>
      </div>
    </>
  );
}
