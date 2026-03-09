import { Metadata } from 'next';
import { getAllLotteries } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { softwareAppSchema, breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { DrawResult } from '@/lib/lotteries/types';
import WhatIfSimulator from '@/components/simulator/WhatIfSimulator';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export interface SimulatorLotteryConfig {
  slug: string;
  name: string;
  mainNumbers: { count: number; max: number };
  bonusNumber: { count: number; max: number; label: string };
  ticketPrice: number;
  colors: { primary: string; ball: string; bonusBall: string };
}

export const metadata: Metadata = {
  title: `What If You Never Missed a Draw? | ${SITE_NAME}`,
  description: 'Enter your lucky numbers and see what would have happened if you played every single draw. Discover your near-misses, total winnings, and biggest what-if moments.',
  openGraph: {
    title: `What If You Never Missed a Draw? | ${SITE_NAME}`,
    description: 'Enter your lucky numbers and see what would have happened if you played every single draw.',
    url: `${SITE_URL}/simulator`,
  },
  alternates: {
    canonical: `${SITE_URL}/simulator`,
  },
};

export default function SimulatorPage() {
  const lotteries = getAllLotteries();

  // Load ALL draws for each active game — the simulator needs full history
  const drawsByGame: Record<string, DrawResult[]> = {};
  const lotteryConfigs: SimulatorLotteryConfig[] = lotteries
    .filter(l => !l.retiredDate)
    .map(lottery => {
      try {
        const data = loadLotteryData(lottery.slug);
        drawsByGame[lottery.slug] = data.draws;
      } catch {
        drawsByGame[lottery.slug] = [];
      }
      return {
        slug: lottery.slug,
        name: lottery.name,
        mainNumbers: { count: lottery.mainNumbers.count, max: lottery.mainNumbers.max },
        bonusNumber: { count: lottery.bonusNumber.count, max: lottery.bonusNumber.max, label: lottery.bonusNumber.label },
        ticketPrice: lottery.ticketPrice,
        colors: { primary: lottery.colors.primary, ball: lottery.colors.ball, bonusBall: lottery.colors.bonusBall },
      };
    });

  return (
    <>
      <JsonLd data={softwareAppSchema({
        name: 'What-If Lottery Simulator',
        description: 'See what would have happened if you played your lucky numbers in every draw',
        url: `${SITE_URL}/simulator`,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'What-If Simulator', url: `${SITE_URL}/simulator` },
      ])} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'What-If Simulator' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          What-If Lottery Simulator
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Enter your lucky numbers and discover what would have happened if you played them in every single draw. See your near-misses, total winnings, and biggest what-if moments.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <WhatIfSimulator lotteries={lotteryConfigs} drawsByGame={drawsByGame} />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800 mb-2">{DISCLAIMER_TEXT}</p>
          <p className="text-xs text-amber-700">
            This simulator uses historical data for entertainment purposes only. Past results do not predict future outcomes.
          </p>
        </div>
      </div>
    </>
  );
}
