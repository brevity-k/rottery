import { Metadata } from 'next';
import { softwareAppSchema, breadcrumbSchema, faqSchema } from '@/lib/seo/structuredData';
import { getTaxCalculatorFaqs } from '@/lib/seo/faqContent';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import TaxCalculator from '@/components/tools/TaxCalculator';
import JsonLd from '@/components/seo/JsonLd';
import FAQSection from '@/components/seo/FAQSection';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: `Lottery Tax Calculator by State - Lump Sum vs Annuity | ${SITE_NAME}`,
  description: 'Calculate your lottery winnings after federal and state taxes. Compare lump sum vs annuity payouts for Powerball, Mega Millions, and more. All 50 states covered.',
  openGraph: {
    title: `Lottery Tax Calculator by State | ${SITE_NAME}`,
    description: 'Calculate your lottery winnings after federal and state taxes. Compare lump sum vs annuity payouts.',
    url: `${SITE_URL}/tools/tax-calculator`,
  },
  alternates: {
    canonical: `${SITE_URL}/tools/tax-calculator`,
  },
};

export default function TaxCalculatorPage() {
  const faqs = getTaxCalculatorFaqs();

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={softwareAppSchema({
        name: 'Lottery Tax Calculator',
        description: 'Calculate lottery winnings after federal and state taxes for all 50 US states',
        url: `${SITE_URL}/tools/tax-calculator`,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Tax Calculator', url: `${SITE_URL}/tools/tax-calculator` },
      ])} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Tools' },
          { label: 'Tax Calculator' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          Lottery Tax Calculator
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Calculate how much you&apos;d actually take home after federal and state taxes. Compare lump sum vs annuity payouts for any US lottery jackpot.
        </p>

        <TaxCalculator />

        <div className="mt-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How Lottery Taxes Work</h2>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                <strong>Federal taxes:</strong> The IRS withholds 24% on lottery winnings over $5,000. However, large jackpots fall into the top federal tax bracket of 37%, meaning you&apos;ll owe an additional 13% when you file your tax return.
              </p>
              <p>
                <strong>State taxes:</strong> Most states tax lottery winnings at their top income tax rate. Eight states have no income tax (AK, FL, NH, SD, TN, TX, WA, WY), and California does not tax lottery winnings.
              </p>
              <p>
                <strong>Lump sum vs annuity:</strong> The lump sum is typically about 50% of the advertised jackpot. While the total tax amount is lower, you receive significantly less. The annuity pays the full advertised amount over 30 annual payments (increasing 5% per year).
              </p>
              <p>
                <strong>Local taxes:</strong> Some cities levy additional taxes. New York City adds 3.876%, and Yonkers adds 1.959%. Baltimore, Maryland also has local taxes.
              </p>
            </div>
          </div>

          <FAQSection faqs={faqs} />

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-sm text-amber-800 mb-2">{DISCLAIMER_TEXT}</p>
            <p className="text-xs text-amber-700">
              Tax calculations are estimates based on 2026 federal brackets and current state rates.
              Consult a qualified tax professional before making financial decisions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
