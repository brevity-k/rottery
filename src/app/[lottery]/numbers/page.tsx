import { notFound } from 'next/navigation';
import { getLottery, getAllLotterySlugs, strategies } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { generateRecommendations } from '@/lib/analysis/recommendations';
import { generateLotteryMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { StrategyType } from '@/lib/lotteries/types';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import NumberGenerator from '@/components/numbers/NumberGenerator';
import RecommendedNumbers from '@/components/numbers/RecommendedNumbers';
import JsonLd from '@/components/seo/JsonLd';
import Card from '@/components/ui/Card';

export function generateStaticParams() {
  return getAllLotterySlugs().map(slug => ({ lottery: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lottery: string }> }) {
  const { lottery: slug } = await params;
  const lottery = getLottery(slug);
  if (!lottery) return {};
  return generateLotteryMetadata(lottery, 'numbers');
}

export default async function NumbersPage({ params }: { params: Promise<{ lottery: string }> }) {
  const { lottery: slug } = await params;
  const lottery = getLottery(slug);
  if (!lottery) notFound();

  let recommendationSets: Record<string, import('@/lib/lotteries/types').RecommendedSet[]> = {};
  try {
    const data = loadLotteryData(slug);
    for (const [key, _] of Object.entries(strategies)) {
      recommendationSets[key] = generateRecommendations(data.draws, lottery, key as StrategyType, 3);
    }
  } catch {
    // Data not yet available
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: lottery.name, url: `${SITE_URL}/${lottery.slug}` },
        { name: 'Number Insights', url: `${SITE_URL}/${lottery.slug}/numbers` },
      ])} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: lottery.name, href: `/${slug}` },
          { label: 'Number Insights' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {lottery.name} Number Insights
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-powered statistical analysis and number recommendations based on historical draw data.
        </p>

        {/* Random Generator */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Quick Pick Generator</h2>
          <NumberGenerator config={lottery} />
        </Card>

        {/* Recommended Numbers by Strategy */}
        {Object.keys(recommendationSets).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistical Recommendations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {Object.entries(strategies).map(([key, strategy]) => (
                <div key={key}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{strategy.name} Strategy</h3>
                  <p className="text-sm text-gray-500 mb-4">{strategy.description}</p>
                  {recommendationSets[key] && (
                    <RecommendedNumbers sets={recommendationSets[key]} config={lottery} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How Our Analysis Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Frequency Analysis</h3>
              <p>We count how often each number has appeared in all historical draws, identifying which numbers appear more or less often than expected.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Hot & Cold Detection</h3>
              <p>Numbers are scored with a weighted system: recent draws count 3x, medium-term 2x, and all-time 1x, revealing current momentum.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Overdue Analysis</h3>
              <p>We compare each number&apos;s current gap to its expected interval, finding numbers that are statistically overdue.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Pair Frequency</h3>
              <p>Our engine identifies which number pairs appear together most often, adding a co-occurrence dimension to recommendations.</p>
            </div>
          </div>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </>
  );
}
