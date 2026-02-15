/**
 * Posts the latest blog post to X (Twitter) using the v2 API.
 *
 * Usage:
 *   X_CONSUMER_KEY=... X_SECRET_KEY=... X_API_ACCESS_TOKEN=... X_API_ACCESS_TOKEN_SECRET=... \
 *   npx tsx scripts/post-to-x.ts
 *
 * Skips gracefully if:
 *   - Required env vars are not set
 *   - No blog posts exist in content/blog/
 */

import fs from 'fs';
import path from 'path';
import { TwitterApi } from 'twitter-api-v2';
import { withRetry } from './lib/retry';
import { RETRY_PRESETS } from './lib/constants';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SITE_URL = 'https://mylottostats.com';
const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const MAX_TWEET_LENGTH = 280;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
}

function extractDateSuffix(filename: string): string {
  // Filenames end with YYYY-MM-DD.json — extract the date for sorting
  const match = filename.match(/(\d{4}-\d{2}-\d{2})\.json$/);
  return match ? match[1] : '';
}

function getLatestBlogPost(): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.json'))
    .sort((a, b) => extractDateSuffix(b).localeCompare(extractDateSuffix(a)));

  if (files.length === 0) return null;

  const content = fs.readFileSync(path.join(BLOG_DIR, files[0]), 'utf-8');
  return JSON.parse(content) as BlogPost;
}

function buildTweet(post: BlogPost): string {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const hashtags = '#Lottery #LotteryStats';
  const prefix = '\u{1F4CA} '; // 📊
  const sep = '\n\n';

  // Title gets priority (max 70 chars)
  const title = post.title.length <= 70 ? post.title : post.title.slice(0, 67) + '...';
  const headline = `${prefix}${title}`;

  // Fixed parts without description: headline + sep + url + sep + hashtags
  const withoutDesc = `${headline}${sep}${url}${sep}${hashtags}`;

  // Budget remaining for description + one separator
  const descBudget = MAX_TWEET_LENGTH - withoutDesc.length - sep.length;

  if (descBudget > 20 && post.description) {
    const description = post.description.length <= descBudget
      ? post.description
      : post.description.slice(0, descBudget - 3) + '...';
    return `${headline}${sep}${description}${sep}${url}${sep}${hashtags}`;
  }

  return withoutDesc;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Validate env vars
  const requiredEnvVars = [
    'X_CONSUMER_KEY',
    'X_SECRET_KEY',
    'X_API_ACCESS_TOKEN',
    'X_API_ACCESS_TOKEN_SECRET',
  ] as const;

  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.log(`Skipping X post: missing env vars: ${missing.join(', ')}`);
    return;
  }

  // Find latest blog post
  const post = getLatestBlogPost();
  if (!post) {
    console.log('Skipping X post: no blog posts found');
    return;
  }

  console.log(`Latest blog post: "${post.title}" (${post.date})`);

  // Build tweet
  const tweet = buildTweet(post);
  console.log(`Tweet (${tweet.length} chars):\n${tweet}\n`);

  if (tweet.length > MAX_TWEET_LENGTH) {
    throw new Error(`Tweet exceeds ${MAX_TWEET_LENGTH} chars (${tweet.length})`);
  }

  // Post to X
  const client = new TwitterApi({
    appKey: process.env.X_CONSUMER_KEY!,
    appSecret: process.env.X_SECRET_KEY!,
    accessToken: process.env.X_API_ACCESS_TOKEN!,
    accessSecret: process.env.X_API_ACCESS_TOKEN_SECRET!,
  });

  const result = await withRetry(
    () => client.v2.tweet(tweet),
    { ...RETRY_PRESETS.X_API, label: 'X API tweet' },
  );

  const tweetId = result.data.id;
  console.log(`Posted to X: https://x.com/i/status/${tweetId}`);
}

main().catch(err => {
  console.error('Failed to post to X:', err);
  process.exit(1);
});
