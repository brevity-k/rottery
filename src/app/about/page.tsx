import { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: `About ${SITE_NAME}`,
  description: `Learn about ${SITE_NAME}, the AI-powered lottery statistics platform providing data-driven insights for US lotteries.`,
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'About', url: `${SITE_URL}/about` },
      ])} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'About' }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About {SITE_NAME}</h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-lg text-gray-600">
            {SITE_NAME} is a free lottery information and statistics platform that provides data-driven insights for all major US lotteries, including Powerball and Mega Millions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8">Our Mission</h2>
          <p className="text-gray-600">
            We believe that lottery players deserve access to comprehensive statistical data and analysis tools. {SITE_NAME} provides transparent, data-driven insights to help you understand lottery number patterns and trends.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8">What We Offer</h2>
          <ul className="text-gray-600 space-y-2 list-disc list-inside">
            <li><strong>Historical Results:</strong> Complete draw history for all major US lotteries</li>
            <li><strong>Statistical Analysis:</strong> Frequency analysis, hot/cold numbers, overdue tracking, and pair frequency data</li>
            <li><strong>Number Insights:</strong> Data-driven number suggestions based on multiple statistical strategies</li>
            <li><strong>Free Tools:</strong> Random number generator and odds calculator</li>
            <li><strong>Educational Content:</strong> Blog posts explaining lottery mechanics and statistics</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8">Our Analysis Engine</h2>
          <p className="text-gray-600">
            Our analysis engine processes millions of historical lottery draw results to identify statistical patterns. We use frequency analysis, weighted scoring systems, gap analysis, and pair co-occurrence tracking to provide comprehensive insights.
          </p>
          <p className="text-gray-600">
            All analysis is performed transparently using publicly available draw data. We do not claim to predict outcomes -- lottery draws are random events, and our analysis is provided for informational and entertainment purposes only.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8">Data Sources</h2>
          <p className="text-gray-600">
            Our lottery data comes from official public sources, including the New York Open Data portal (SODA API). Data is updated daily to include the latest draw results.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8">Important Disclaimer</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-amber-800">
              {SITE_NAME} is an informational platform only. We do not sell lottery tickets, facilitate gambling, or guarantee any outcomes. Lottery drawings are random events. Past results do not influence future drawings. All content is for entertainment and educational purposes only. Please play responsibly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
