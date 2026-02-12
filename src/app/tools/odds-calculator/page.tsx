import { Metadata } from 'next';
import { getAllLotteries } from '@/lib/lotteries/config';
import { softwareAppSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/structuredData';
import { getOddsCalculatorFaqs } from '@/lib/seo/faqContent';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import JsonLd from '@/components/seo/JsonLd';
import FAQSection from '@/components/seo/FAQSection';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: `Lottery Odds Calculator | ${SITE_NAME}`,
  description: 'Understand your lottery odds. Compare jackpot probabilities for Powerball, Mega Millions, and other US lotteries.',
  openGraph: {
    title: `Lottery Odds Calculator | ${SITE_NAME}`,
    description: 'Understand your lottery odds. Compare jackpot probabilities for Powerball, Mega Millions, and other US lotteries.',
    url: `${SITE_URL}/tools/odds-calculator`,
  },
  alternates: { canonical: `${SITE_URL}/tools/odds-calculator` },
};

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function combinations(n: number, r: number): number {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export default function OddsCalculatorPage() {
  const lotteries = getAllLotteries();
  const faqs = getOddsCalculatorFaqs();

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={softwareAppSchema({
        name: 'Lottery Odds Calculator',
        description: 'Calculate and compare lottery odds for US lotteries',
        url: `${SITE_URL}/tools/odds-calculator`,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Odds Calculator', url: `${SITE_URL}/tools/odds-calculator` },
      ])} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Tools' },
          { label: 'Odds Calculator' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          Lottery Odds Calculator
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Understand the mathematical probabilities behind US lottery games.
        </p>

        {lotteries.map(lottery => {
          const mainCombs = combinations(lottery.mainNumbers.max, lottery.mainNumbers.count);
          const hasBonus = lottery.bonusNumber.count > 0;
          const bonusCombs = hasBonus ? lottery.bonusNumber.max : 1;
          const totalOdds = mainCombs * bonusCombs;

          return (
            <Card key={lottery.slug} className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{lottery.name} Odds</h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Jackpot Odds</p>
                  <p className="text-2xl font-bold text-red-600">{lottery.jackpotOdds}</p>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Main numbers:</strong> Choose {lottery.mainNumbers.count} from {lottery.mainNumbers.max} = {mainCombs.toLocaleString()} combinations
                </p>
                {hasBonus && (
                  <p>
                    <strong>{lottery.bonusNumber.label}:</strong> Choose 1 from {lottery.bonusNumber.max} = {bonusCombs} options
                  </p>
                )}
                <p>
                  <strong>Total combinations:</strong> {hasBonus ? `${mainCombs.toLocaleString()} x ${bonusCombs} = ` : ''}{totalOdds.toLocaleString()}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">To put this in perspective:</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>You&apos;re about {Math.round(totalOdds / 2000000)}x more likely to be struck by lightning</li>
                  <li>If you bought 1 ticket per draw, on average it would take {Math.round(totalOdds / 156).toLocaleString()} years</li>
                </ul>
              </div>
            </Card>
          );
        })}

        <FAQSection faqs={faqs} />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mt-8">
          <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </>
  );
}
