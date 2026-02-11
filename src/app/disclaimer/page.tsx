import { Metadata } from 'next';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: `Disclaimer`,
  description: `${SITE_NAME} disclaimer. Important information about our lottery statistics and number recommendations.`,
};

export default function DisclaimerPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Disclaimer', url: `${SITE_URL}/disclaimer` },
      ])} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Disclaimer' }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Disclaimer</h1>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <p className="text-lg font-medium text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Entertainment Only</h2>
          <p className="text-gray-600">
            All content on {SITE_NAME}, including number recommendations, statistical analysis, frequency data, and any other insights, is provided strictly for entertainment and informational purposes. Nothing on this website constitutes financial advice, gambling advice, or a guarantee of any kind.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">Randomness of Lottery Draws</h2>
          <p className="text-gray-600">
            Lottery drawings are independent random events. Each draw is completely independent of previous draws. While our statistical analysis examines historical patterns, these patterns do not influence future outcomes in any way.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">No Prediction Claims</h2>
          <p className="text-gray-600">
            {SITE_NAME} does not predict, forecast, or guarantee lottery outcomes. Our &quot;AI-powered insights&quot; refer to statistical analysis algorithms that process historical data. These algorithms identify patterns in past data but cannot and do not predict future results.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">Not a Lottery Retailer</h2>
          <p className="text-gray-600">
            {SITE_NAME} does not sell lottery tickets, accept wagers, or facilitate any gambling transactions. We are an information-only platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">Play Responsibly</h2>
          <p className="text-gray-600">
            If you choose to play the lottery, please do so responsibly. Never spend more than you can afford to lose. If you or someone you know has a gambling problem, please contact the National Council on Problem Gambling at 1-800-522-4700.
          </p>
        </div>
      </div>
    </>
  );
}
