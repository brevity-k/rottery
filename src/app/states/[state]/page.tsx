import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getState, getAllStateSlugs } from '@/lib/states/config';
import { getLottery } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { breadcrumbSchema, faqSchema } from '@/lib/seo/structuredData';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ResultsTable from '@/components/lottery/ResultsTable';
import JsonLd from '@/components/seo/JsonLd';
import Card from '@/components/ui/Card';

export function generateStaticParams() {
  return getAllStateSlugs().map(state => ({ state }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state: slug } = await params;
  const state = getState(slug);
  if (!state) return {};

  const title = `${state.name} Lottery - Tax Rate, Games & How to Claim | ${SITE_NAME}`;
  const description = `${state.name} lottery information: ${state.taxRate > 0 ? `${(state.taxRate * 100).toFixed(2)}% state tax` : 'no state tax'} on winnings, ${state.availableGames.length} available games, prize claim procedures, and more.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/states/${slug}` },
    alternates: { canonical: `${SITE_URL}/states/${slug}` },
  };
}

function getStateFaqs(state: ReturnType<typeof getState>) {
  if (!state) return [];
  return [
    {
      question: `What is the lottery tax rate in ${state.name}?`,
      answer: state.taxRate > 0
        ? `${state.name} taxes lottery winnings at ${(state.taxRate * 100).toFixed(2)}%. ${state.taxNotes || ''}`
        : `${state.name} does not impose a state tax on lottery winnings. ${state.taxNotes || ''}`,
    },
    {
      question: `What lottery games are available in ${state.name}?`,
      answer: `${state.name} offers ${state.availableGames.length} major lottery games including ${state.availableGames.map(g => getLottery(g)?.name || g).join(', ')}.`,
    },
    {
      question: `How do I claim lottery prizes in ${state.name}?`,
      answer: state.claimInfo,
    },
    {
      question: `What is the minimum age to buy lottery tickets in ${state.name}?`,
      answer: `You must be at least ${state.purchaseAge} years old to purchase lottery tickets in ${state.name}.`,
    },
  ];
}

export default async function StateHubPage({ params }: { params: Promise<{ state: string }> }) {
  const { state: slug } = await params;
  const state = getState(slug);
  if (!state) notFound();

  const faqs = getStateFaqs(state);

  // Load latest draw for each available game
  const gameData = state.availableGames.map(gameSlug => {
    const config = getLottery(gameSlug);
    let latestDraw = null;
    try {
      const data = loadLotteryData(gameSlug);
      latestDraw = data.draws[0];
    } catch {
      // Data not yet available
    }
    return { config, latestDraw };
  }).filter(g => g.config);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'States', url: `${SITE_URL}/states` },
        { name: state.name, url: `${SITE_URL}/states/${slug}` },
      ])} />
      <JsonLd data={faqSchema(faqs)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'States', href: '/states' },
          { label: state.name },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {state.name} Lottery
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Everything you need to know about playing the lottery in {state.name}: available games, tax rates, and how to claim prizes.
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-1">State Tax</p>
            <p className="text-2xl font-bold text-gray-900">
              {state.taxRate > 0 ? `${(state.taxRate * 100).toFixed(2)}%` : '0%'}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-1">Games Available</p>
            <p className="text-2xl font-bold text-gray-900">{state.availableGames.length}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-1">Min Purchase Age</p>
            <p className="text-2xl font-bold text-gray-900">{state.purchaseAge}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-1">Official Site</p>
            <a href={state.lotteryWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
              Visit →
            </a>
          </Card>
        </div>

        {/* Tax Information */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Tax Information</h2>
          <p className="text-gray-600 mb-3">{state.taxNotes || `${state.name} taxes lottery winnings at ${(state.taxRate * 100).toFixed(2)}%.`}</p>
          <p className="text-sm text-gray-500">
            In addition to state taxes, federal taxes apply: 24% withholding + up to 37% top marginal rate.{' '}
            <Link href="/tools/tax-calculator" className="text-blue-600 hover:underline">
              Use our Tax Calculator
            </Link>{' '}
            for a detailed breakdown.
          </p>
        </Card>

        {/* Available Games */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Games in {state.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameData.map(({ config, latestDraw }) => config && (
              <Link
                key={config.slug}
                href={`/${config.slug}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{config.name}</h3>
                  <span className="text-xs text-gray-500">{config.drawDays.join(', ')}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {config.bonusNumber.count > 0
                    ? `${config.mainNumbers.count}/${config.mainNumbers.max} + ${config.bonusNumber.count}/${config.bonusNumber.max}`
                    : `${config.mainNumbers.count}/${config.mainNumbers.max}`
                  }
                  {' '} | Odds: {config.jackpotOdds}
                </p>
                {latestDraw && (
                  <p className="text-xs text-gray-400 mt-1">
                    Latest: {latestDraw.numbers.join(', ')}{config.bonusNumber.count > 0 ? ` + ${latestDraw.bonusNumber}` : ''}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </Card>

        {/* How to Claim */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">How to Claim Prizes in {state.name}</h2>
          <p className="text-gray-600">{state.claimInfo}</p>
        </Card>

        {/* Quick Facts */}
        {state.facts.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Quick Facts</h2>
            <ul className="space-y-2">
              {state.facts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {fact}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Latest Results for Available Games */}
        {gameData.some(g => g.latestDraw) && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Results</h2>
            {gameData.map(({ config, latestDraw }) => {
              if (!config || !latestDraw) return null;
              let draws: import('@/lib/lotteries/types').DrawResult[] = [];
              try {
                const data = loadLotteryData(config.slug);
                draws = data.draws.slice(0, 5);
              } catch {
                // Data not available
              }
              if (draws.length === 0) return null;
              return (
                <div key={config.slug} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{config.name}</h3>
                    <Link href={`/${config.slug}/results`} className="text-xs text-blue-600 hover:underline">
                      View All →
                    </Link>
                  </div>
                  <ResultsTable draws={draws} config={config} limit={5} />
                </div>
              );
            })}
          </Card>
        )}

        {/* FAQ */}
        <Card className="mb-8">
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

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </>
  );
}
