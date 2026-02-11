import Link from 'next/link';
import { SITE_NAME, DISCLAIMER_TEXT } from '@/lib/utils/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">{SITE_NAME}</h3>
            <p className="text-sm">AI-Powered Lottery Number Insights & Statistics for all major US lotteries.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Lotteries</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/powerball" className="hover:text-white transition-colors">Powerball</Link></li>
              <li><Link href="/mega-millions" className="hover:text-white transition-colors">Mega Millions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tools/number-generator" className="hover:text-white transition-colors">Number Generator</Link></li>
              <li><Link href="/tools/odds-calculator" className="hover:text-white transition-colors">Odds Calculator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-xs text-center">{DISCLAIMER_TEXT}</p>
          <p className="text-xs text-center mt-2">&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
