import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLottery, getAllLotterySlugs } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { generateLotteryMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, datasetSchema } from '@/lib/seo/structuredData';
import { SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { getYearsRange, formatLastUpdated } from '@/lib/utils/formatters';
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
  let lastUpdated = '';
  try {
    const data = loadLotteryData(slug);
    draws = data.draws;
    years = getYearsRange(draws);
    lastUpdated = data.lastUpdated;
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
      {draws.length > 0 && (
        <JsonLd data={datasetSchema({
          name: `${lottery.name} Winning Numbers History`,
          description: `Complete historical draw results for ${lottery.name}, including winning numbers${lottery.bonusNumber.count > 0 ? ` and ${lottery.bonusNumber.label}` : ''}.`,
          url: `${SITE_URL}/${lottery.slug}/results`,
          recordCount: draws.length,
          dateRange: `${draws[draws.length - 1]?.date}/${draws[0]?.date}`,
        })} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: lottery.name, href: `/${slug}` },
          { label: 'Results' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {lottery.name} Past Results
        </h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-2">
            {formatLastUpdated(lastUpdated)} · <a href={lottery.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Verify with {lottery.name} ↗</a>
          </p>
        )}
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

        <p className="mt-8 text-center text-sm text-gray-500">{DISCLAIMER_TEXT}</p>
      </div>
    </>
  );
}
