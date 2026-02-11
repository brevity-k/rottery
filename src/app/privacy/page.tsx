import { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: `Privacy Policy`,
  description: `${SITE_NAME} privacy policy. Learn how we handle your data.`,
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Privacy Policy', url: `${SITE_URL}/privacy` },
      ])} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
          <p className="text-gray-600">
            {SITE_NAME} is committed to protecting your privacy. We collect minimal information necessary to operate our website:
          </p>
          <ul className="text-gray-600 space-y-1 list-disc list-inside">
            <li><strong>Analytics Data:</strong> We use analytics tools to understand how visitors use our site. This includes pages visited, time spent, and general location data.</li>
            <li><strong>Cookies:</strong> We use cookies for analytics and advertising purposes. You can manage cookie preferences in your browser settings.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900">2. How We Use Information</h2>
          <p className="text-gray-600">We use collected information to:</p>
          <ul className="text-gray-600 space-y-1 list-disc list-inside">
            <li>Improve our website content and user experience</li>
            <li>Understand usage patterns and popular content</li>
            <li>Display relevant advertisements</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900">3. Third-Party Services</h2>
          <p className="text-gray-600">
            We may use third-party services including Google Analytics and Google AdSense. These services may collect information according to their own privacy policies.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">4. Data Storage</h2>
          <p className="text-gray-600">
            {SITE_NAME} does not store personal user data on our servers. All number generation happens client-side in your browser. We do not collect or store any lottery numbers you generate.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">5. Your Rights</h2>
          <p className="text-gray-600">
            You have the right to opt out of analytics tracking and manage your cookie preferences through your browser settings.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">6. Contact</h2>
          <p className="text-gray-600">
            For privacy-related inquiries, please contact us through our website.
          </p>
        </div>
      </div>
    </>
  );
}
