/**
 * Shared constants for automation scripts.
 * Centralizes values that change together (e.g., model rotation, dataset IDs).
 *
 * IMPORTANT: When adding a new lottery game, update KNOWN_DATASETS, MIN_DRAWS,
 * and LOTTERY_DATA_FILES together. check-new-datasets.ts and update-data.ts
 * both reference KNOWN_DATASETS to stay in sync.
 */

import { RetryOptions } from './retry';

/** Claude model used for blog generation and tax rate updates. */
export const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

// ---------------------------------------------------------------------------
// Dataset registry — single source of truth for all lottery SODA dataset IDs
// ---------------------------------------------------------------------------

/** SODA dataset IDs and metadata. Used by update-data.ts and check-new-datasets.ts. */
export const KNOWN_DATASETS: Record<string, { name: string; slug: string; datasetId: string; retiredDate?: string }> = {
  powerball:        { name: 'Powerball',      slug: 'powerball',      datasetId: 'd6yy-54nr' },
  'mega-millions':  { name: 'Mega Millions',  slug: 'mega-millions',  datasetId: '5xaw-6ayf' },
  'cash4life':      { name: 'Cash4Life',      slug: 'cash4life',      datasetId: 'kwxv-fwze', retiredDate: '2026-02-21' },
  'ny-lotto':       { name: 'NY Lotto',       slug: 'ny-lotto',       datasetId: '6nbc-h7bj' },
  'take5':          { name: 'Take 5',         slug: 'take5',          datasetId: 'dg63-4siq' },
};

/** Lookup from dataset ID → game slug (for check-new-datasets.ts deduplication). */
export const DATASET_ID_TO_GAME: Record<string, string> = Object.fromEntries(
  Object.values(KNOWN_DATASETS).map(d => [d.datasetId, d.name])
);

/** Check if a game is retired as of the given date. */
export function isGameRetired(gameKey: string, asOf: Date = new Date()): boolean {
  const game = KNOWN_DATASETS[gameKey];
  if (!game?.retiredDate) return false;
  return asOf >= new Date(game.retiredDate);
}

// ---------------------------------------------------------------------------
// Retry presets — documented rationale for each API type
// ---------------------------------------------------------------------------

export const RETRY_PRESETS = {
  /** SODA data fetches: critical path, use 3 attempts with moderate delay. */
  SODA_DATA: { maxAttempts: 3, baseDelayMs: 2000 } satisfies RetryOptions,
  /** SODA catalog searches: exploratory, 2 attempts with short delay. */
  SODA_CATALOG: { maxAttempts: 2, baseDelayMs: 1000 } satisfies RetryOptions,
  /** Claude API calls: expensive, 2 attempts with longer delay for rate limits. */
  CLAUDE_API: { maxAttempts: 2, baseDelayMs: 3000 } satisfies RetryOptions,
  /** GitHub API calls: 2 attempts with moderate delay. */
  GITHUB_API: { maxAttempts: 2, baseDelayMs: 2000 } satisfies RetryOptions,
} as const;

// ---------------------------------------------------------------------------
// Blog generation constants
// ---------------------------------------------------------------------------

/** Seasonal topic overrides — keyed by month number (1-12). */
export const SEASONAL_OVERRIDES: Record<number, string> = {
  1: 'New Year lottery number trends and fresh start strategies for the new year',
  3: 'Tax season guide for lottery winners — what to know before filing',
  4: 'Tax season guide for lottery winners — maximizing your after-tax payout',
  11: 'Holiday jackpot fever — Thanksgiving and year-end draw analysis',
  12: 'Holiday jackpot fever — Christmas lottery traditions and year-end jackpot recap',
};

/** One-time special topics — keyed by YYYY-MM date prefix. */
export const SPECIAL_TOPICS: Record<string, string> = {
  '2026-02': 'Cash4Life retirement on February 21 — what it means for players and what comes next',
};

/** Blog topic rotation — 14 topics cycling daily, paired 1:1 with TARGET_KEYWORDS. */
export const TOPICS: string[] = [
  'Recap and analysis of the latest Powerball draw results',
  'Weekly hot and cold number trends across all five lottery games',
  'Mega Millions draw analysis and statistical trends',
  'NY lottery game spotlight: NY Lotto and Take 5 patterns and strategies',
  'Deep dive into overdue numbers across all games that are statistically due',
  'Number pair spotlight: which combinations appear together most often',
  'Mega Millions draw recap and weekend lottery outlook',
  'NY Lotto analysis: frequency trends and number insights',
  'Take 5 midday vs evening draw comparison and patterns',
  'Lottery tax analysis: which states give you the best net payout',
  'Multi-game comparison: Powerball vs Mega Millions — which has better odds',
  'Statistical anomalies and interesting patterns in recent draws',
  'State lottery spotlight: best states for lottery winners in terms of taxes',
  'Lump sum vs annuity: what the numbers actually show for current jackpots',
];

/** SEO target keywords to weave into blog posts, rotated alongside TOPICS. */
export const TARGET_KEYWORDS: string[] = [
  'most common powerball numbers',
  'mega millions winning numbers analysis',
  'hot and cold lottery numbers',
  'lottery tax calculator by state',
  'powerball number frequency',
  'overdue powerball numbers',
  'lump sum vs annuity lottery',
  'best states for lottery winners',
  'powerball vs mega millions odds',
  'ny lotto winning numbers',
  'ny lotto results today',
  'take 5 winning numbers',
  'lottery number pairs patterns',
  'how to pick lottery numbers statistically',
];

// ---------------------------------------------------------------------------
// Build validation constants (shared between validate-build.ts & seo-health-check.ts)
// ---------------------------------------------------------------------------

/** Minimum draw counts per game — safety floor that should never be crossed. */
export const MIN_DRAWS: Record<string, number> = {
  'powerball.json': 1800,
  'mega-millions.json': 2400,
  'cash4life.json': 2900,
  'ny-lotto.json': 2500,
  'take5.json': 12000,
};

/** Minimum page count for build output. Derived from game pages + number pages + states + tools + blog + static. */
export const MIN_PAGES = 550;

/** All lottery data files that must exist. */
export const LOTTERY_DATA_FILES = ['powerball.json', 'mega-millions.json', 'cash4life.json', 'ny-lotto.json', 'take5.json'];

/** Maximum days before data is considered stale in SEO health check. */
export const DATA_STALENESS_DAYS = 7;

/** Forbidden terms in blog posts — never claim prediction or guaranteed outcomes. */
export const BLOG_FORBIDDEN_TERMS = ['prediction', 'guaranteed', 'winning strategy', 'sure win', 'proven method'];

/** Minimum word count for auto-generated blog posts. */
export const BLOG_MIN_WORDS = 400;
