import { notFound } from 'next/navigation';
import { getLottery, getAllLotterySlugs } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { calculateFrequency, getTopFrequent, getLeastFrequent } from '@/lib/analysis/frequency';
import { calculateHotCold } from '@/lib/analysis/hotCold';
import { calculateOverdue, getMostOverdue } from '@/lib/analysis/overdue';
import { calculatePairs } from '@/lib/analysis/pairs';
import { generateLotteryMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { formatPercentage } from '@/lib/utils/formatters';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import HotColdChart from '@/components/numbers/HotColdChart';
import LotteryBall from '@/components/lottery/LotteryBall';
import JsonLd from '@/components/seo/JsonLd';
import Card from '@/components/ui/Card';

export function generateStaticParams() {
  return getAllLotterySlugs().map(slug => ({ lottery: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lottery: string }> }) {
  const { lottery: slug } = await params;
  const lottery = getLottery(slug);
  if (!lottery) return {};
  return generateLotteryMetadata(lottery, 'statistics');
}

export default async function StatisticsPage({ params }: { params: Promise<{ lottery: string }> }) {
  const { lottery: slug } = await params;
  const lottery = getLottery(slug);
  if (!lottery) notFound();

  let frequency: import('@/lib/lotteries/types').NumberFrequency[] = [];
  let hotCold: import('@/lib/lotteries/types').HotColdNumber[] = [];
  let overdue: import('@/lib/lotteries/types').OverdueNumber[] = [];
  let pairs: import('@/lib/lotteries/types').PairFrequency[] = [];
  let totalDraws = 0;

  try {
    const data = loadLotteryData(slug);
    totalDraws = data.draws.length;
    frequency = calculateFrequency(data.draws, lottery.mainNumbers.max, 'main');
    hotCold = calculateHotCold(data.draws, lottery.mainNumbers.max, 'main');
    overdue = calculateOverdue(data.draws, lottery.mainNumbers.max, 'main');
    pairs = calculatePairs(data.draws, 15);
  } catch {
    // Data not available
  }

  const topFrequent = getTopFrequent(frequency, 10);
  const leastFrequent = getLeastFrequent(frequency, 10);
  const mostOverdue = getMostOverdue(overdue, 10);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: lottery.name, url: `${SITE_URL}/${lottery.slug}` },
        { name: 'Statistics', url: `${SITE_URL}/${lottery.slug}/statistics` },
      ])} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: lottery.name, href: `/${slug}` },
          { label: 'Statistics' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {lottery.name} Statistics
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Statistical analysis of {totalDraws.toLocaleString()} historical draws.
        </p>

        {hotCold.length > 0 && (
          <>
            {/* Hot/Cold Chart */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hot & Cold Numbers</h2>
              <p className="text-sm text-gray-500 mb-4">Weighted score based on recent (3x), medium-term (2x), and all-time (1x) frequency.</p>
              <HotColdChart data={hotCold} limit={30} />
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Hot</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded-full"></span> Warm</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Cold</span>
              </div>
            </Card>

            {/* Top Frequent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Most Frequent Numbers</h2>
                <div className="space-y-3">
                  {topFrequent.map(f => (
                    <div key={f.number} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LotteryBall number={f.number} type="main" size="sm" />
                        <span className="text-sm text-gray-600">{f.count} times</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatPercentage(f.percentage)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Least Frequent Numbers</h2>
                <div className="space-y-3">
                  {leastFrequent.map(f => (
                    <div key={f.number} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LotteryBall number={f.number} type="main" size="sm" />
                        <span className="text-sm text-gray-600">{f.count} times</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatPercentage(f.percentage)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Overdue */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Most Overdue Numbers</h2>
              <p className="text-sm text-gray-500 mb-4">Numbers that haven&apos;t appeared for longer than their expected interval.</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {mostOverdue.map(o => (
                  <div key={o.number} className="text-center p-3 bg-gray-50 rounded-lg">
                    <LotteryBall number={o.number} type="main" size="md" />
                    <p className="text-xs text-gray-500 mt-2">{o.drawsSinceLastDrawn} draws ago</p>
                    <p className="text-xs font-medium text-red-600">{Math.round(o.overdueRatio * 100)}% overdue</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pairs */}
            {pairs.length > 0 && (
              <Card className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Most Common Pairs</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {pairs.map((p, i) => (
                    <div key={i} className="flex items-center justify-center gap-1 p-3 bg-gray-50 rounded-lg">
                      <LotteryBall number={p.pair[0]} type="main" size="sm" />
                      <span className="text-gray-400 text-xs">+</span>
                      <LotteryBall number={p.pair[1]} type="main" size="sm" />
                      <span className="text-xs text-gray-500 ml-1">({p.count})</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {hotCold.length === 0 && (
          <Card>
            <p className="text-center text-gray-500 py-8">No statistical data available yet. Run the data update script to fetch historical data.</p>
          </Card>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </>
  );
}
