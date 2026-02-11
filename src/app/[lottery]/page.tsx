import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLottery, getAllLotterySlugs } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { generateLotteryMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema, lotteryFaqs } from '@/lib/seo/structuredData';
import { SITE_URL } from '@/lib/utils/constants';
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
  try {
    const data = loadLotteryData(slug);
    draws = data.draws;
  } catch {
    // Data not yet available
  }

  const faqs = lotteryFaqs(lottery);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: lottery.name, url: `${SITE_URL}/${lottery.slug}` },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: lottery.name }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {lottery.name} Results & Numbers
        </h1>
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
              <p className="font-semibold">{lottery.mainNumbers.count}/{lottery.mainNumbers.max} + {lottery.bonusNumber.count}/{lottery.bonusNumber.max}</p>
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

        <p className="mt-8 text-center text-sm text-gray-500">
          For entertainment purposes only. Lottery outcomes are random.
        </p>
      </div>
    </>
  );
}
