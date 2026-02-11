import { getAllLotteries } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { generateHomeMetadata } from '@/lib/seo/metadata';
import { websiteSchema } from '@/lib/seo/structuredData';
import LotteryCard from '@/components/lottery/LotteryCard';
import JsonLd from '@/components/seo/JsonLd';
import Link from 'next/link';

export const metadata = generateHomeMetadata();

export default function HomePage() {
  const lotteries = getAllLotteries();

  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            AI-Powered Lottery Insights
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
            Statistical analysis and number recommendations for all major US lotteries. Data-driven insights from millions of historical draws.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/powerball/numbers" className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Get Powerball Numbers
            </Link>
            <Link href="/mega-millions/numbers" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors border border-blue-400">
              Get Mega Millions Numbers
            </Link>
          </div>
        </div>
      </section>

      {/* Lottery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">US Lotteries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lotteries.map(lottery => {
            let latestDraw;
            try {
              const data = loadLotteryData(lottery.slug);
              latestDraw = data.draws[0];
            } catch {
              // Data not yet available
            }
            return (
              <LotteryCard key={lottery.slug} lottery={lottery} latestDraw={latestDraw} />
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Statistical Analysis</h3>
              <p className="text-gray-600">We analyze millions of historical lottery draws to identify frequency patterns and trends.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">Our analysis engine combines multiple strategies to provide data-driven number suggestions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Random Generator</h3>
              <p className="text-gray-600">Generate cryptographically secure random numbers instantly, right in your browser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-sm text-gray-500">
          For entertainment purposes only. Lottery outcomes are random. Past results do not influence future drawings.
        </p>
      </section>
    </>
  );
}
