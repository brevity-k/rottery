import { notFound } from 'next/navigation';
import { getLottery, getAllLotterySlugs } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { calculateFrequency, getTopFrequent, getLeastFrequent } from '@/lib/analysis/frequency';
import { calculateHotCold } from '@/lib/analysis/hotCold';
import { calculateOverdue, getMostOverdue } from '@/lib/analysis/overdue';
import { calculatePairs } from '@/lib/analysis/pairs';
import { calculateTriplets } from '@/lib/analysis/triplets';
import { calculateQuadruplets } from '@/lib/analysis/quadruplets';
import { generateLotteryMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/structuredData';
import { getStatisticsFaqs } from '@/lib/seo/faqContent';
import { SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { formatPercentage, formatLastUpdated } from '@/lib/utils/formatters';
import { getRelatedPosts } from '@/lib/blog-links';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import HotColdChart from '@/components/numbers/HotColdChart';
import LotteryBall from '@/components/lottery/LotteryBall';
import JsonLd from '@/components/seo/JsonLd';
import FAQSection from '@/components/seo/FAQSection';
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
  let triplets: import('@/lib/lotteries/types').TripletFrequency[] = [];
  let quadruplets: import('@/lib/lotteries/types').QuadrupletFrequency[] = [];
  let totalDraws = 0;
  let lastUpdated = '';

  try {
    const data = loadLotteryData(slug);
    totalDraws = data.draws.length;
    lastUpdated = data.lastUpdated;
    frequency = calculateFrequency(data.draws, lottery.mainNumbers.max, 'main');
    hotCold = calculateHotCold(data.draws, lottery.mainNumbers.max, 'main');
    overdue = calculateOverdue(data.draws, lottery.mainNumbers.max, 'main');
    pairs = calculatePairs(data.draws, 15);
    triplets = calculateTriplets(data.draws, 15);
    quadruplets = calculateQuadruplets(data.draws, 10);
  } catch {
    // Data not available
  }

  const topFrequent = getTopFrequent(frequency, 10);
  const leastFrequent = getLeastFrequent(frequency, 10);
  const mostOverdue = getMostOverdue(overdue, 10);

  const faqs = getStatisticsFaqs(lottery);
  const relatedPosts = getRelatedPosts(slug, lottery.name, 3);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: lottery.name, url: `${SITE_URL}/${lottery.slug}` },
        { name: 'Statistics', url: `${SITE_URL}/${lottery.slug}/statistics` },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: lottery.name, href: `/${slug}` },
          { label: 'Statistics' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {lottery.name} Statistics
        </h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-2">
            {formatLastUpdated(lastUpdated)} · <a href={lottery.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Verify with {lottery.name} ↗</a>
          </p>
        )}
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
                    <Link key={f.number} href={`/${slug}/numbers/main-${f.number}`} className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-1 -mx-1 transition-colors">
                      <div className="flex items-center gap-3">
                        <LotteryBall number={f.number} type="main" size="sm" />
                        <span className="text-sm text-gray-600">{f.count} times</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatPercentage(f.percentage)}</span>
                    </Link>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Least Frequent Numbers</h2>
                <div className="space-y-3">
                  {leastFrequent.map(f => (
                    <Link key={f.number} href={`/${slug}/numbers/main-${f.number}`} className="flex items-center justify-between hover:bg-gray-50 rounded-lg p-1 -mx-1 transition-colors">
                      <div className="flex items-center gap-3">
                        <LotteryBall number={f.number} type="main" size="sm" />
                        <span className="text-sm text-gray-600">{f.count} times</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{formatPercentage(f.percentage)}</span>
                    </Link>
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
                  <Link key={o.number} href={`/${slug}/numbers/main-${o.number}`} className="text-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                    <LotteryBall number={o.number} type="main" size="md" />
                    <p className="text-xs text-gray-500 mt-2">{o.drawsSinceLastDrawn} draws ago</p>
                    <p className="text-xs font-medium text-red-600">{Math.round(o.overdueRatio * 100)}% overdue</p>
                  </Link>
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
                      <Link href={`/${slug}/numbers/main-${p.pair[0]}`}><LotteryBall number={p.pair[0]} type="main" size="sm" /></Link>
                      <span className="text-gray-400 text-xs">+</span>
                      <Link href={`/${slug}/numbers/main-${p.pair[1]}`}><LotteryBall number={p.pair[1]} type="main" size="sm" /></Link>
                      <span className="text-xs text-gray-500 ml-1">({p.count})</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Triplets */}
            {triplets.length > 0 && (
              <Card className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Most Common Triplets</h2>
                <p className="text-sm text-gray-500 mb-4">Three-number combinations that appear together most frequently.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {triplets.map((t, i) => (
                    <div key={i} className="flex items-center justify-center gap-1 p-3 bg-gray-50 rounded-lg">
                      <Link href={`/${slug}/numbers/main-${t.triplet[0]}`}><LotteryBall number={t.triplet[0]} type="main" size="sm" /></Link>
                      <span className="text-gray-400 text-xs">+</span>
                      <Link href={`/${slug}/numbers/main-${t.triplet[1]}`}><LotteryBall number={t.triplet[1]} type="main" size="sm" /></Link>
                      <span className="text-gray-400 text-xs">+</span>
                      <Link href={`/${slug}/numbers/main-${t.triplet[2]}`}><LotteryBall number={t.triplet[2]} type="main" size="sm" /></Link>
                      <span className="text-xs text-gray-500 ml-1">({t.count})</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Quadruplets */}
            {quadruplets.length > 0 && (
              <Card className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Most Common Quadruplets</h2>
                <p className="text-sm text-gray-500 mb-4">Four-number combinations that appear together most frequently.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {quadruplets.map((q, i) => (
                    <div key={i} className="flex items-center justify-center gap-1 p-3 bg-gray-50 rounded-lg">
                      <Link href={`/${slug}/numbers/main-${q.quadruplet[0]}`}><LotteryBall number={q.quadruplet[0]} type="main" size="sm" /></Link>
                      <span className="text-gray-400 text-xs">+</span>
                      <Link href={`/${slug}/numbers/main-${q.quadruplet[1]}`}><LotteryBall number={q.quadruplet[1]} type="main" size="sm" /></Link>
                      <span className="text-gray-400 text-xs">+</span>
                      <Link href={`/${slug}/numbers/main-${q.quadruplet[2]}`}><LotteryBall number={q.quadruplet[2]} type="main" size="sm" /></Link>
                      <span className="text-gray-400 text-xs">+</span>
                      <Link href={`/${slug}/numbers/main-${q.quadruplet[3]}`}><LotteryBall number={q.quadruplet[3]} type="main" size="sm" /></Link>
                      <span className="text-xs text-gray-500 ml-1">({q.count})</span>
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

        <FAQSection faqs={faqs} />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </>
  );
}
