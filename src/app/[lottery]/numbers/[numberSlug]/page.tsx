import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getLottery, getAllLotteries } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { calculateFrequency } from '@/lib/analysis/frequency';
import { calculateHotCold } from '@/lib/analysis/hotCold';
import { calculateGaps } from '@/lib/analysis/gaps';
import { calculatePairs } from '@/lib/analysis/pairs';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/structuredData';
import { getNumberDetailFaqs } from '@/lib/seo/faqContent';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import LotteryBall from '@/components/lottery/LotteryBall';
import JsonLd from '@/components/seo/JsonLd';
import FAQSection from '@/components/seo/FAQSection';
import Card from '@/components/ui/Card';
import Link from 'next/link';

function parseNumberSlug(slug: string): { type: 'main' | 'bonus'; number: number } | null {
  const match = slug.match(/^(main|bonus)-(\d+)$/);
  if (!match) return null;
  return { type: match[1] as 'main' | 'bonus', number: parseInt(match[2], 10) };
}

export function generateStaticParams() {
  const allLotteries = getAllLotteries();
  const params: { lottery: string; numberSlug: string }[] = [];

  for (const lottery of allLotteries) {
    for (let n = 1; n <= lottery.mainNumbers.max; n++) {
      params.push({ lottery: lottery.slug, numberSlug: `main-${n}` });
    }
    if (lottery.bonusNumber.count > 0) {
      for (let n = 1; n <= lottery.bonusNumber.max; n++) {
        params.push({ lottery: lottery.slug, numberSlug: `bonus-${n}` });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ lottery: string; numberSlug: string }> }): Promise<Metadata> {
  const { lottery: slug, numberSlug } = await params;
  const lottery = getLottery(slug);
  const parsed = parseNumberSlug(numberSlug);
  if (!lottery || !parsed) return {};

  const label = parsed.type === 'bonus' ? lottery.bonusNumber.label : 'Number';
  const title = `${lottery.name} ${label} #${parsed.number} — Frequency & Analysis | ${SITE_NAME}`;
  const description = `Detailed analysis of ${lottery.name} ${label.toLowerCase()} ${parsed.number}: frequency, hot/cold status, gap analysis, common pairings, and recent appearances.`;
  const url = `${SITE_URL}/${lottery.slug}/numbers/${numberSlug}`;

  return {
    title,
    description,
    openGraph: { title, description, url },
    alternates: { canonical: url },
  };
}

export default async function NumberDetailPage({ params }: { params: Promise<{ lottery: string; numberSlug: string }> }) {
  const { lottery: slug, numberSlug } = await params;
  const lottery = getLottery(slug);
  const parsed = parseNumberSlug(numberSlug);
  if (!lottery || !parsed) notFound();

  const { type, number } = parsed;
  const hasBonus = lottery.bonusNumber.count > 0;

  // Validate
  if (type === 'main' && (number < 1 || number > lottery.mainNumbers.max)) notFound();
  if (type === 'bonus' && (!hasBonus || number < 1 || number > lottery.bonusNumber.max)) notFound();

  const label = type === 'bonus' ? lottery.bonusNumber.label : 'Number';

  let frequencyData: import('@/lib/lotteries/types').NumberFrequency | undefined;
  let hotColdData: import('@/lib/lotteries/types').HotColdNumber | undefined;
  let gapData: import('@/lib/lotteries/types').GapAnalysis | undefined;
  let topPairings: { number: number; count: number }[] = [];
  let recentDraws: import('@/lib/lotteries/types').DrawResult[] = [];
  let frequencyRank = 0;
  let totalNumbers = 0;

  try {
    const data = loadLotteryData(slug);
    const maxNum = type === 'main' ? lottery.mainNumbers.max : lottery.bonusNumber.max;

    const allFreq = calculateFrequency(data.draws, maxNum, type);
    frequencyData = allFreq.find(f => f.number === number);
    frequencyRank = allFreq.findIndex(f => f.number === number) + 1;
    totalNumbers = allFreq.length;

    const allHotCold = calculateHotCold(data.draws, maxNum, type);
    hotColdData = allHotCold.find(h => h.number === number);

    const allGaps = calculateGaps(data.draws, maxNum, type);
    gapData = allGaps.find(g => g.number === number);

    // Common pairings (main numbers only)
    if (type === 'main') {
      const allPairs = calculatePairs(data.draws, 500);
      const pairsWithNumber = allPairs
        .filter(p => p.pair[0] === number || p.pair[1] === number)
        .map(p => ({
          number: p.pair[0] === number ? p.pair[1] : p.pair[0],
          count: p.count,
        }))
        .slice(0, 10);
      topPairings = pairsWithNumber;
    }

    // Recent appearances (last 10)
    recentDraws = data.draws
      .filter(d => {
        const nums = type === 'main' ? d.numbers : (d.bonusNumber !== null ? [d.bonusNumber] : []);
        return nums.includes(number);
      })
      .slice(0, 10);
  } catch {
    // Data not available
  }

  const faqs = getNumberDetailFaqs(lottery, number, type);

  // Prev/next navigation
  const maxNum = type === 'main' ? lottery.mainNumbers.max : lottery.bonusNumber.max;
  const prevNum = number > 1 ? number - 1 : null;
  const nextNum = number < maxNum ? number + 1 : null;
  const prevHref = prevNum ? `/${slug}/numbers/${type}-${prevNum}` : null;
  const nextHref = nextNum ? `/${slug}/numbers/${type}-${nextNum}` : null;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: lottery.name, url: `${SITE_URL}/${lottery.slug}` },
        { name: 'Number Insights', url: `${SITE_URL}/${lottery.slug}/numbers` },
        { name: `${label} #${number}`, url: `${SITE_URL}/${lottery.slug}/numbers/${numberSlug}` },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: lottery.name, href: `/${slug}` },
          { label: 'Number Insights', href: `/${slug}/numbers` },
          { label: `${label} #${number}` },
        ]} />

        <div className="flex items-center gap-4 mb-2">
          <LotteryBall number={number} type={type} size="lg" color={type === 'bonus' ? lottery.colors.bonusBall : undefined} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {lottery.name} {label} #{number}
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-8">
          Detailed frequency analysis and historical data for {type === 'bonus' ? lottery.bonusNumber.label.toLowerCase() : 'number'} {number}.
        </p>

        {/* Stats Grid */}
        {frequencyData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <p className="text-sm text-gray-500">Frequency</p>
              <p className="text-2xl font-bold text-gray-900">{frequencyData.count}</p>
              <p className="text-xs text-gray-500">Rank #{frequencyRank} of {totalNumbers}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Hot/Cold</p>
              <p className={`text-2xl font-bold ${
                hotColdData?.classification === 'hot' ? 'text-red-600' :
                hotColdData?.classification === 'cold' ? 'text-blue-600' : 'text-amber-600'
              }`}>
                {hotColdData?.classification === 'hot' ? 'Hot' :
                 hotColdData?.classification === 'cold' ? 'Cold' : 'Warm'}
              </p>
              <p className="text-xs text-gray-500">Score: {hotColdData?.score ?? 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{frequencyData.drawsSinceLastDrawn}</p>
              <p className="text-xs text-gray-500">draws since last seen</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Gap Analysis</p>
              <p className="text-2xl font-bold text-gray-900">{gapData?.avgGap ?? 0}</p>
              <p className="text-xs text-gray-500">avg gap (min {gapData?.minGap ?? 0}, max {gapData?.maxGap ?? 0})</p>
            </Card>
          </div>
        )}

        {/* Common Pairings */}
        {topPairings.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Most Common Pairings with #{number}</h2>
            <p className="text-sm text-gray-500 mb-4">Numbers that appear most often alongside {label.toLowerCase()} {number}.</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {topPairings.map(p => (
                <Link
                  key={p.number}
                  href={`/${slug}/numbers/main-${p.number}`}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <LotteryBall number={p.number} type="main" size="sm" />
                  <span className="text-xs text-gray-500">({p.count}x)</span>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Appearances */}
        {recentDraws.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Appearances</h2>
            <div className="space-y-3">
              {recentDraws.map((draw, i) => (
                <div key={i} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                    {new Date(draw.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {draw.drawTime ? ` (${draw.drawTime})` : ''}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {draw.numbers.map((n, j) => (
                      <span
                        key={j}
                        className={`w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                          n === number && type === 'main'
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                            : 'bg-white text-gray-900 border-2 border-gray-300'
                        }`}
                      >
                        {n}
                      </span>
                    ))}
                    {hasBonus && draw.bonusNumber !== null && (
                      draw.bonusNumber === number && type === 'bonus' ? (
                        <span className="w-8 h-8 rounded-full inline-flex items-center justify-center text-xs font-bold bg-blue-600 text-white ring-2 ring-blue-300">
                          {draw.bonusNumber}
                        </span>
                      ) : (
                        <LotteryBall number={draw.bonusNumber} type="bonus" size="sm" color={lottery.colors.bonusBall} />
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {!frequencyData && (
          <Card className="mb-8">
            <p className="text-center text-gray-500 py-8">No data available for this number.</p>
          </Card>
        )}

        {/* Prev/Next Navigation */}
        <nav className="flex items-center justify-between mb-8" aria-label="Number navigation">
          {prevHref ? (
            <Link href={prevHref} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span aria-hidden="true">&larr;</span> {label} #{prevNum}
            </Link>
          ) : <span />}
          <Link href={`/${slug}/numbers`} className="text-sm text-blue-600 hover:underline">
            All Numbers
          </Link>
          {nextHref ? (
            <Link href={nextHref} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              {label} #{nextNum} <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : <span />}
        </nav>

        <FAQSection faqs={faqs} />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </>
  );
}
