import { notFound } from 'next/navigation';
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
  const params: { lottery: string; year: string }[] = [];
  for (const slug of getAllLotterySlugs()) {
    try {
      const data = loadLotteryData(slug);
      const years = getYearsRange(data.draws);
      for (const year of years) {
        params.push({ lottery: slug, year: year.toString() });
      }
    } catch {
      // Data not available yet
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ lottery: string; year: string }> }) {
  const { lottery: slug, year } = await params;
  const lottery = getLottery(slug);
  if (!lottery) return {};
  return generateLotteryMetadata(lottery, 'results', { year });
}

export default async function YearResultsPage({ params }: { params: Promise<{ lottery: string; year: string }> }) {
  const { lottery: slug, year } = await params;
  const lottery = getLottery(slug);
  if (!lottery) notFound();

  const yearNum = parseInt(year);
  if (isNaN(yearNum)) notFound();

  let yearDraws: import('@/lib/lotteries/types').DrawResult[] = [];
  try {
    const data = loadLotteryData(slug);
    yearDraws = data.draws.filter(d => new Date(d.date).getFullYear() === yearNum);
  } catch {
    // Data not available
  }

  if (yearDraws.length === 0) notFound();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: lottery.name, url: `${SITE_URL}/${lottery.slug}` },
        { name: 'Results', url: `${SITE_URL}/${lottery.slug}/results` },
        { name: year, url: `${SITE_URL}/${lottery.slug}/results/${year}` },
      ])} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: lottery.name, href: `/${slug}` },
          { label: 'Results', href: `/${slug}/results` },
          { label: year },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {lottery.name} Results {year}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          All {lottery.name} winning numbers and results from {year}. {yearDraws.length} draws total.
        </p>

        <Card padding={false}>
          <ResultsTable draws={yearDraws} config={lottery} />
        </Card>
      </div>
    </>
  );
}
