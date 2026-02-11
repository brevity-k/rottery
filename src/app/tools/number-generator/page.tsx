import { Metadata } from 'next';
import { getAllLotteries } from '@/lib/lotteries/config';
import { softwareAppSchema, breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import NumberGenerator from '@/components/numbers/NumberGenerator';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: `Lottery Number Generator - Free Random Numbers | ${SITE_NAME}`,
  description: 'Generate random lottery numbers for any US lottery. Uses cryptographically secure randomization for Powerball, Mega Millions, and more.',
};

export default function NumberGeneratorPage() {
  const lotteries = getAllLotteries();

  return (
    <>
      <JsonLd data={softwareAppSchema({
        name: 'Lottery Number Generator',
        description: 'Generate cryptographically secure random lottery numbers',
        url: `${SITE_URL}/tools/number-generator`,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Tools', url: `${SITE_URL}/tools/number-generator` },
        { name: 'Number Generator', url: `${SITE_URL}/tools/number-generator` },
      ])} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Tools' },
          { label: 'Number Generator' },
        ]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          Lottery Number Generator
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Generate random numbers for any US lottery game. Our generator uses cryptographically secure randomization.
        </p>

        {lotteries.map(lottery => (
          <Card key={lottery.slug} className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">{lottery.name}</h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              {lottery.mainNumbers.count} numbers from 1-{lottery.mainNumbers.max} + 1 {lottery.bonusNumber.label} from 1-{lottery.bonusNumber.max}
            </p>
            <NumberGenerator config={lottery} />
          </Card>
        ))}

        <Card className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About This Tool</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              Our lottery number generator uses <code className="bg-gray-100 px-1 rounded">crypto.getRandomValues()</code>,
              the Web Crypto API standard for generating cryptographically strong random numbers. This is the same technology
              used in security applications.
            </p>
            <p>
              Numbers are generated entirely in your browser - no data is sent to any server. Each generation is completely
              independent and unbiased.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
