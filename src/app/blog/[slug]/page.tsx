import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { calculateReadingTime } from '@/lib/utils/formatters';
import { breadcrumbSchema, articleSchema } from '@/lib/seo/structuredData';
import { getBlogPost, getAllBlogSlugs } from '@/lib/blog';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export function generateStaticParams() {
  return getAllBlogSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
  };
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: post.title, url: `${SITE_URL}/blog/${slug}` },
      ])} />
      <JsonLd data={articleSchema({
        title: post.title,
        description: post.description,
        slug,
        date: post.date,
      })} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]} />

        <article>
          <header className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryStyle(post.category)}`}>
                {post.category}
              </span>
              <time className="text-sm text-gray-400" dateTime={post.date}>{formatDate(post.date)} · {calculateReadingTime(post.content)}</time>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h1>
            <p className="text-lg text-gray-500 leading-relaxed">{post.description}</p>
          </header>

          <div
            className="prose prose-gray prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-li:text-gray-600
              prose-strong:text-gray-900
              prose-ul:my-4 prose-ol:my-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Disclaimer:</strong> {DISCLAIMER_TEXT}
            </p>
          </div>
        </article>

        <nav className="mt-10 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link href="/blog" className="text-blue-600 hover:underline font-medium">&larr; All Posts</Link>
        </nav>
      </div>
    </>
  );
}
