import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import { calculateReadingTime } from '@/lib/utils/formatters';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { getAllBlogPosts } from '@/lib/blog';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: `Lottery Blog - Tips, Statistics & Guides`,
  description: `Read expert lottery articles covering Powerball, Mega Millions, statistics, and more. Data-driven insights from ${SITE_NAME}.`,
  openGraph: {
    title: 'Lottery Blog - Tips, Statistics & Guides',
    description: `Read expert lottery articles covering Powerball, Mega Millions, statistics, and more. Data-driven insights from ${SITE_NAME}.`,
    url: `${SITE_URL}/blog`,
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const CATEGORY_COLORS: Record<string, string> = {
  Guides: 'bg-green-50 text-green-700 border-green-200',
  Statistics: 'bg-purple-50 text-purple-700 border-purple-200',
  Comparison: 'bg-orange-50 text-orange-700 border-orange-200',
  History: 'bg-amber-50 text-amber-700 border-amber-200',
  'Draw Recap': 'bg-blue-50 text-blue-700 border-blue-200',
  'Weekly Analysis': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Number Trends': 'bg-pink-50 text-pink-700 border-pink-200',
  'Deep Dive': 'bg-teal-50 text-teal-700 border-teal-200',
};

function getCategoryStyle(category: string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-50 text-gray-700 border-gray-200';
}

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
      ])} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Blog' }]} />

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Lottery Blog</h1>
          <p className="text-lg text-gray-500">
            Data-driven insights, draw recaps, and statistical analysis for US lottery games.
          </p>
        </div>

        {/* Featured latest post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block group mb-10">
            <article className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 sm:p-8 transition-shadow hover:shadow-lg">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryStyle(featured.category)}`}>
                  {featured.category}
                </span>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">Latest</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                {featured.title}
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">{featured.description}</p>
              <div className="flex items-center justify-between">
                <time className="text-sm text-gray-400" dateTime={featured.date}>{formatDate(featured.date)} · {calculateReadingTime(featured.content)}</time>
                <span className="text-sm font-medium text-blue-600 group-hover:underline">Read article &rarr;</span>
              </div>
            </article>
          </Link>
        )}

        {/* Rest of posts */}
        <div className="grid gap-6 sm:grid-cols-2">
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="bg-white border border-gray-200 rounded-xl p-5 h-full flex flex-col transition-shadow hover:shadow-md hover:border-gray-300">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getCategoryStyle(post.category)}`}>
                    {post.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">{post.description}</p>
                <time className="text-xs text-gray-400" dateTime={post.date}>{formatDate(post.date)} · {calculateReadingTime(post.content)}</time>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
