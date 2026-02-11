import { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: `Terms of Service`,
  description: `${SITE_NAME} terms of service. Understand the conditions for using our platform.`,
};

export default function TermsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Terms of Service', url: `${SITE_URL}/terms` },
      ])} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p className="text-gray-600">
            By accessing and using {SITE_NAME}, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">2. Service Description</h2>
          <p className="text-gray-600">
            {SITE_NAME} provides lottery information, statistics, and analysis tools for entertainment and educational purposes. We do not sell lottery tickets or facilitate any form of gambling.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">3. No Guarantees</h2>
          <p className="text-gray-600">
            All number recommendations, statistics, and analysis provided on {SITE_NAME} are for entertainment purposes only. We make no guarantees regarding lottery outcomes. Lottery drawings are random events, and past results do not influence future drawings.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">4. Data Accuracy</h2>
          <p className="text-gray-600">
            While we strive to maintain accurate and up-to-date lottery data, we cannot guarantee the accuracy of all information. Always verify results with official lottery websites.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">5. Intellectual Property</h2>
          <p className="text-gray-600">
            All content, design, and functionality on {SITE_NAME} are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or modify our content without permission.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
          <p className="text-gray-600">
            {SITE_NAME} shall not be liable for any damages arising from the use of our website or reliance on the information provided. Use our tools and information at your own risk.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">7. Responsible Play</h2>
          <p className="text-gray-600">
            We encourage responsible lottery play. If you or someone you know has a gambling problem, please contact the National Council on Problem Gambling at 1-800-522-4700.
          </p>
        </div>
      </div>
    </>
  );
}
