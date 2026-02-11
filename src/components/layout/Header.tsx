import Link from 'next/link';
import { getAllLotteries } from '@/lib/lotteries/config';

export default function Header() {
  const lotteries = getAllLotteries();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">🎰</span>
            <span className="text-xl font-bold text-gray-900">Rottery</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {lotteries.map(lottery => (
              <Link
                key={lottery.slug}
                href={`/${lottery.slug}`}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {lottery.name}
              </Link>
            ))}
            <Link href="/tools/number-generator" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Tools
            </Link>
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Blog
            </Link>
          </nav>

          <MobileMenu lotteries={lotteries} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ lotteries }: { lotteries: ReturnType<typeof getAllLotteries> }) {
  return (
    <div className="md:hidden">
      <details className="relative">
        <summary className="list-none cursor-pointer p-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </summary>
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {lotteries.map(lottery => (
            <Link
              key={lottery.slug}
              href={`/${lottery.slug}`}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {lottery.name}
            </Link>
          ))}
          <Link href="/tools/number-generator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Tools
          </Link>
          <Link href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Blog
          </Link>
        </div>
      </details>
    </div>
  );
}
