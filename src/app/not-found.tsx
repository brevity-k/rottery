import Link from 'next/link';

export default function NotFound() {
  const links = [
    { href: '/', label: 'Home', description: 'Back to homepage' },
    { href: '/powerball', label: 'Powerball', description: 'Results & statistics' },
    { href: '/mega-millions', label: 'Mega Millions', description: 'Results & statistics' },
    { href: '/cash4life', label: 'Cash4Life', description: 'Results & statistics' },
    { href: '/ny-lotto', label: 'NY Lotto', description: 'Results & statistics' },
    { href: '/take5', label: 'Take 5', description: 'Results & statistics' },
    { href: '/tools/tax-calculator', label: 'Tax Calculator', description: 'Estimate your winnings' },
    { href: '/tools/number-generator', label: 'Number Generator', description: 'Random number sets' },
    { href: '/tools/ticket-checker', label: 'Ticket Checker', description: 'Check your numbers' },
    { href: '/tools/odds-calculator', label: 'Odds Calculator', description: 'Prize probabilities' },
    { href: '/blog', label: 'Blog', description: 'Tips & guides' },
    { href: '/states', label: 'States', description: 'State lottery info' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="text-7xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all text-left"
          >
            <p className="font-semibold text-gray-900 text-sm">{link.label}</p>
            <p className="text-xs text-gray-500 mt-1">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
