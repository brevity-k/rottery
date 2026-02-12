import { LotteryConfig } from '@/lib/lotteries/types';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'AI-Powered Lottery Number Insights & Statistics',
    inLanguage: 'en-US',
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

export function datasetSchema(dataset: {
  name: string;
  description: string;
  url: string;
  recordCount: number;
  dateRange: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: dataset.name,
    description: dataset.description,
    url: dataset.url,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: dataset.url,
    },
    temporalCoverage: dataset.dateRange,
    variableMeasured: `${dataset.recordCount} lottery draw results`,
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
  const hasBonus = lottery.bonusNumber.count > 0;

  const formatDesc = hasBonus
    ? `${lottery.mainNumbers.count} numbers from 1-${lottery.mainNumbers.max} and ${lottery.bonusNumber.count} ${lottery.bonusNumber.label} from 1-${lottery.bonusNumber.max}`
    : `${lottery.mainNumbers.count} numbers from 1-${lottery.mainNumbers.max}`;

  const faqs = [
    {
      question: `What are the ${lottery.name} numbers?`,
      answer: `${lottery.name} players select ${formatDesc}. Drawings are held on ${lottery.drawDays.join(', ')} at ${lottery.drawTime}.`,
    },
    {
      question: `What are the odds of winning ${lottery.name}?`,
      answer: `The odds of winning the ${lottery.name} top prize are ${lottery.jackpotOdds}.`,
    },
    {
      question: `How much does a ${lottery.name} ticket cost?`,
      answer: getTicketCostAnswer(lottery),
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

  return faqs;
}

function getTicketCostAnswer(lottery: LotteryConfig): string {
  switch (lottery.slug) {
    case 'powerball':
      return `A ${lottery.name} ticket costs $${lottery.ticketPrice}. For an additional $1, you can add the Power Play option to multiply non-jackpot prizes by 2x to 10x.`;
    case 'mega-millions':
      return `A ${lottery.name} ticket costs $${lottery.ticketPrice}. Every ticket includes an automatic 2x-10x multiplier for non-jackpot prizes at no extra cost.`;
    case 'cash4life':
      return `A ${lottery.name} ticket costs $${lottery.ticketPrice}. The top prize is $1,000 a day for life, with a second prize of $1,000 a week for life.`;
    case 'ny-lotto':
      return `A ${lottery.name} ticket costs $${lottery.ticketPrice}. You can add the NY Lotto Extra for an additional $1 to boost non-jackpot prizes.`;
    case 'take5':
      return `A ${lottery.name} ticket costs $${lottery.ticketPrice}. There are two drawings daily — midday at 2:30 PM and evening at 10:30 PM ET.`;
    default:
      return `A ${lottery.name} ticket costs $${lottery.ticketPrice}.`;
  }
}
