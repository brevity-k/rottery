import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
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
          <header className="mb-8">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{post.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-2">{post.title}</h1>
            <p className="text-lg text-gray-600">{post.description}</p>
            <p className="text-sm text-gray-400 mt-2">Published: {post.date}</p>
          </header>

          <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
          </div>
        </article>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Link href="/blog" className="text-blue-600 hover:underline">&larr; Back to Blog</Link>
        </div>
      </div>
    </>
  );
}
