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
            <ToolsDropdown />
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

function ToolsDropdown() {
  return (
    <div className="relative group">
      <button className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
        Tools
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute left-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2">
          <Link href="/tools/number-generator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Number Generator
          </Link>
          <Link href="/tools/odds-calculator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Odds Calculator
          </Link>
        </div>
      </div>
    </div>
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
          <div className="border-t border-gray-100 my-1" />
          <span className="block px-4 py-1 text-xs font-semibold text-gray-400 uppercase">Tools</span>
          <Link href="/tools/number-generator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Number Generator
          </Link>
          <Link href="/tools/odds-calculator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Odds Calculator
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <Link href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Blog
          </Link>
        </div>
      </details>
    </div>
  );
}
