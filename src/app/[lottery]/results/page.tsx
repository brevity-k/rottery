import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLottery, getAllLotterySlugs } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { generateLotteryMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_URL } from '@/lib/utils/constants';
import { getYearsRange } from '@/lib/utils/formatters';
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
  return generateLotteryMetadata(lottery, 'results');
}

export default async function ResultsPage({ params }: { params: Promise<{ lottery: string }> }) {
  const { lottery: slug } = await params;
  const lottery = getLottery(slug);
  if (!lottery) notFound();

  let draws: import('@/lib/lotteries/types').DrawResult[] = [];
  let years: number[] = [];
  try {
    const data = loadLotteryData(slug);
    draws = data.draws;
    years = getYearsRange(draws);
  } catch {
    // Data not available
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: lottery.name, url: `${SITE_URL}/${lottery.slug}` },
        { name: 'Results', url: `${SITE_URL}/${lottery.slug}/results` },
      ])} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: lottery.name, href: `/${slug}` },
          { label: 'Results' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {lottery.name} Past Results
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Complete history of {lottery.name} winning numbers and draw results.
        </p>

        {/* Year Links */}
        {years.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {years.map(year => (
              <Link
                key={year}
                href={`/${slug}/results/${year}`}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {year}
              </Link>
            ))}
          </div>
        )}

        {draws.length > 0 ? (
          <Card padding={false}>
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-500">Showing {draws.length} results</p>
            </div>
            <ResultsTable draws={draws} config={lottery} limit={100} />
          </Card>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-8">No results data available yet. Run the data update script to fetch historical data.</p>
          </Card>
        )}
      </div>
    </>
  );
}
