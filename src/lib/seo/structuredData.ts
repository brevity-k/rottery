import { LotteryConfig } from '@/lib/lotteries/types';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-Powered Lottery Number Insights & Statistics',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  slug: string;
  date: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}/blog/${article.slug}`,
    datePublished: article.date,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function softwareAppSchema(tool: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function lotteryFaqs(lottery: LotteryConfig) {
  return [
    {
      question: `What are the ${lottery.name} numbers?`,
      answer: `${lottery.name} players select ${lottery.mainNumbers.count} numbers from 1-${lottery.mainNumbers.max} and ${lottery.bonusNumber.count} ${lottery.bonusNumber.label} from 1-${lottery.bonusNumber.max}. Drawings are held on ${lottery.drawDays.join(', ')} at ${lottery.drawTime}.`,
    },
    {
      question: `What are the odds of winning ${lottery.name}?`,
      answer: `The odds of winning the ${lottery.name} jackpot are ${lottery.jackpotOdds}. There are 9 prize tiers in total with various odds.`,
    },
    {
      question: `How much does a ${lottery.name} ticket cost?`,
      answer: `A ${lottery.name} ticket costs $${lottery.ticketPrice}. Additional options like Power Play or Megaplier are available for an extra $1.`,
    },
    {
      question: `When are ${lottery.name} drawings?`,
      answer: `${lottery.name} drawings are held every ${lottery.drawDays.join(', ')} at ${lottery.drawTime}.`,
    },
    {
      question: `What are the most common ${lottery.name} numbers?`,
      answer: `The most frequently drawn numbers change over time. Visit our statistics page for the latest frequency analysis based on historical data.`,
    },
  ];
}
