import { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: `Contact Us - ${SITE_NAME}`,
  description: `Have a question or feedback? Get in touch with the ${SITE_NAME} team. We typically respond within 1-2 business days.`,
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Contact', url: `${SITE_URL}/contact` },
      ])} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Contact' }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 mb-8">
          Have a question, suggestion, or feedback? We&apos;d love to hear from you.
          Fill out the form below and we&apos;ll get back to you within 1-2 business days.
        </p>

        <ContactForm />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            You can also reach us directly at{' '}
            <a href="mailto:brevity1s.wos@gmail.com" className="text-blue-600 hover:underline">
              brevity1s.wos@gmail.com
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
