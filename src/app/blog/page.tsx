import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { getAllBlogPosts } from '@/lib/blog';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: `Lottery Blog - Tips, Statistics & Guides`,
  description: `Read expert lottery articles covering Powerball, Mega Millions, statistics, and more. Data-driven insights from ${SITE_NAME}.`,
};

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
      ])} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Blog' }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lottery Blog</h1>
        <p className="text-lg text-gray-600 mb-8">
          Tips, statistics, and guides for US lottery games. Data-driven insights from our analysis engine.
        </p>

        <div className="space-y-6">
          {blogPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <Card>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{post.category}</span>
                <h2 className="text-xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                <p className="text-gray-600 mt-1">{post.description}</p>
                <p className="text-sm text-gray-400 mt-2">{post.date}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
