import { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates } from '@/lib/states/config';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: `US Lottery by State - Tax Rates, Games & Claim Info | ${SITE_NAME}`,
  description: 'Find lottery information for every US state. State tax rates on winnings, available games, how to claim prizes, and more.',
  openGraph: {
    title: `US Lottery by State | ${SITE_NAME}`,
    description: 'Find lottery information for every US state. Tax rates, available games, and claim procedures.',
    url: `${SITE_URL}/states`,
  },
  alternates: { canonical: `${SITE_URL}/states` },
};

export default function StatesIndexPage() {
  const states = getAllStates();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'States', url: `${SITE_URL}/states` },
      ])} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'States' }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          US Lottery by State
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">
          Explore lottery information for the top US states. Find state tax rates on winnings, available games, how to claim prizes, and more.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {states.map(state => (
            <Link key={state.slug} href={`/states/${state.slug}`} className="group">
              <Card className="h-full hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {state.name}
                  </h2>
                  <span className="text-sm font-mono text-gray-400">{state.abbreviation}</span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-700">Tax Rate:</span>{' '}
                    {state.taxRate > 0 ? `${(state.taxRate * 100).toFixed(2)}%` : 'No state tax'}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Games:</span>{' '}
                    {state.availableGames.length} available
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Min Age:</span>{' '}
                    {state.purchaseAge}
                  </p>
                </div>

                <p className="text-blue-600 text-sm font-medium mt-4 group-hover:underline">
                  View Details →
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
