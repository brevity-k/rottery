import { Metadata } from 'next';
import { getAllLotteries } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { softwareAppSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/structuredData';
import { getTicketCheckerFaqs } from '@/lib/seo/faqContent';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { DrawResult } from '@/lib/lotteries/types';
import TicketChecker from '@/components/tools/TicketChecker';
import JsonLd from '@/components/seo/JsonLd';
import FAQSection from '@/components/seo/FAQSection';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: `Lottery Ticket Checker - Check Your Numbers | ${SITE_NAME}`,
  description: 'Check your lottery numbers against past draws. Instantly see how many numbers you matched for Powerball, Mega Millions, Cash4Life, NY Lotto, and Take 5.',
  openGraph: {
    title: `Lottery Ticket Checker | ${SITE_NAME}`,
    description: 'Check your lottery numbers against past draws. Instantly see how many numbers you matched.',
    url: `${SITE_URL}/tools/ticket-checker`,
  },
  alternates: {
    canonical: `${SITE_URL}/tools/ticket-checker`,
  },
};

export default function TicketCheckerPage() {
  const lotteries = getAllLotteries();
  const faqs = getTicketCheckerFaqs();

  // Load last 365 days of draws for each game
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const cutoff = oneYearAgo.toISOString().split('T')[0];

  const drawsByGame: Record<string, DrawResult[]> = {};
  const lotteryConfigs = lotteries.map(lottery => {
    try {
      const data = loadLotteryData(lottery.slug);
      drawsByGame[lottery.slug] = data.draws.filter(d => d.date >= cutoff);
    } catch {
      drawsByGame[lottery.slug] = [];
    }
    return {
      slug: lottery.slug,
      name: lottery.name,
      mainNumbers: lottery.mainNumbers,
      bonusNumber: lottery.bonusNumber,
    };
  });

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={softwareAppSchema({
        name: 'Lottery Ticket Checker',
        description: 'Check your lottery numbers against historical draw results',
        url: `${SITE_URL}/tools/ticket-checker`,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Ticket Checker', url: `${SITE_URL}/tools/ticket-checker` },
      ])} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Tools' },
          { label: 'Ticket Checker' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          Lottery Ticket Checker
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Enter your numbers and select a draw date to see how many numbers you matched. Covers the last 365 days of draws.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <TicketChecker lotteries={lotteryConfigs} drawsByGame={drawsByGame} />
        </div>

        <FAQSection faqs={faqs} />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800 mb-2">{DISCLAIMER_TEXT}</p>
          <p className="text-xs text-amber-700">
            This is an unofficial checker. Always verify your results with your official state lottery.
          </p>
        </div>
      </div>
    </>
  );
}
