/**
 * Auto-generates a daily blog post using Claude API + lottery data.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-blog-post.ts
 *
 * Skips gracefully if:
 *   - ANTHROPIC_API_KEY is not set
 *   - A post for today already exists
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { withRetry } from './lib/retry';
import { CLAUDE_MODEL, SEASONAL_OVERRIDES, SPECIAL_TOPICS, TOPICS, TARGET_KEYWORDS, BLOG_FORBIDDEN_TERMS, BLOG_MIN_WORDS, KNOWN_DATASETS, isGameRetired, RETRY_PRESETS } from './lib/constants';

// ---------------------------------------------------------------------------
// Types (self-contained – no @/ imports so tsx can run standalone)
// ---------------------------------------------------------------------------

interface DrawResult {
  date: string;
  numbers: number[];
  bonusNumber: number | null;
  multiplier?: number;
  drawTime?: 'midday' | 'evening';
}

interface LotteryData {
  lottery: string;
  lastUpdated: string;
  draws: DrawResult[];
}

interface NumberStat {
  number: number;
  count: number;
}

interface OverdueStat {
  number: number;
  drawsSince: number;
}

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

function loadLotteryData(slug: string): LotteryData | null {
  const filePath = path.join(process.cwd(), 'src', 'data', `${slug}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Lightweight analysis helpers (no external deps)
// ---------------------------------------------------------------------------

function getHotNumbers(draws: DrawResult[], max: number, count: number): NumberStat[] {
  const freq = new Map<number, number>();
  for (let i = 1; i <= max; i++) freq.set(i, 0);
  const recent = draws.slice(0, 100);
  for (const d of recent) {
    for (const n of d.numbers) freq.set(n, (freq.get(n) || 0) + 1);
  }
  return Array.from(freq.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

function getColdNumbers(draws: DrawResult[], max: number, count: number): NumberStat[] {
  const freq = new Map<number, number>();
  for (let i = 1; i <= max; i++) freq.set(i, 0);
  const recent = draws.slice(0, 100);
  for (const d of recent) {
    for (const n of d.numbers) freq.set(n, (freq.get(n) || 0) + 1);
  }
  return Array.from(freq.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => a.count - b.count)
    .slice(0, count);
}

function getOverdueNumbers(draws: DrawResult[], max: number, count: number): OverdueStat[] {
  const lastSeen = new Map<number, number>();
  for (let i = 1; i <= max; i++) lastSeen.set(i, draws.length);
  for (let i = 0; i < draws.length; i++) {
    for (const n of draws[i].numbers) {
      if (!lastSeen.has(n) || lastSeen.get(n) === draws.length) {
        lastSeen.set(n, i);
      }
    }
  }
  return Array.from(lastSeen.entries())
    .map(([number, idx]) => ({ number, drawsSince: idx }))
    .sort((a, b) => b.drawsSince - a.drawsSince)
    .slice(0, count);
}

function getTopPairs(draws: DrawResult[], count: number): { pair: string; count: number }[] {
  const pairMap = new Map<string, number>();
  const recent = draws.slice(0, 200);
  for (const d of recent) {
    const nums = [...d.numbers].sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]}-${nums[j]}`;
        pairMap.set(key, (pairMap.get(key) || 0) + 1);
      }
    }
  }
  return Array.from(pairMap.entries())
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

// ---------------------------------------------------------------------------
// Game configs — blog-specific fields + metadata derived from KNOWN_DATASETS
// ---------------------------------------------------------------------------

const GAMES = [
  { slug: 'powerball', name: 'Powerball', maxMain: 69, hasBonus: true, bonusLabel: 'PB' },
  { slug: 'mega-millions', name: 'Mega Millions', maxMain: 70, hasBonus: true, bonusLabel: 'MB' },
  { slug: 'cash4life', name: 'Cash4Life', maxMain: 60, hasBonus: true, bonusLabel: 'CB' },
  { slug: 'ny-lotto', name: 'NY Lotto', maxMain: 59, hasBonus: true, bonusLabel: 'Bonus' },
  { slug: 'take5', name: 'Take 5', maxMain: 39, hasBonus: false, bonusLabel: '' },
];

// ---------------------------------------------------------------------------
// Existing post titles (to avoid duplicates)
// ---------------------------------------------------------------------------

function getExistingTitles(): string[] {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  try {
    return fs
      .readdirSync(blogDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const raw = fs.readFileSync(path.join(blogDir, f), 'utf-8');
        return (JSON.parse(raw) as BlogPost).title;
      });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Topic rotation (14 topics, cycling through all games)
// ---------------------------------------------------------------------------

// Validate that TOPICS and TARGET_KEYWORDS stay in sync (both from constants.ts)
if (TOPICS.length !== TARGET_KEYWORDS.length) {
  throw new Error(
    `TOPICS (${TOPICS.length}) and TARGET_KEYWORDS (${TARGET_KEYWORDS.length}) must have the same length. ` +
    `Update scripts/lib/constants.ts to keep them in sync.`
  );
}

function getTopicForToday(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const yearMonth = now.toISOString().slice(0, 7); // YYYY-MM

  // Check for one-time special topics first
  if (SPECIAL_TOPICS[yearMonth]) {
    return SPECIAL_TOPICS[yearMonth];
  }

  // Check for seasonal overrides
  if (SEASONAL_OVERRIDES[month]) {
    return SEASONAL_OVERRIDES[month];
  }

  // Fall back to standard rotation (day 1 = Jan 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86400000
  ) + 1;
  return TOPICS[dayOfYear % TOPICS.length];
}

function getTargetKeywordForToday(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86400000
  ) + 1;
  return TARGET_KEYWORDS[dayOfYear % TARGET_KEYWORDS.length];
}

// ---------------------------------------------------------------------------
// Build analysis for a game
// ---------------------------------------------------------------------------

function buildGameAnalysis(slug: string, name: string, maxMain: number, hasBonus: boolean, bonusLabel: string): string | null {
  const data = loadLotteryData(slug);
  if (!data || data.draws.length === 0) return null;

  const latest = data.draws[0];
  const last5 = data.draws.slice(0, 5);
  const hot = getHotNumbers(data.draws, maxMain, 10);
  const cold = getColdNumbers(data.draws, maxMain, 10);
  const overdue = getOverdueNumbers(data.draws, maxMain, 10);
  const pairs = getTopPairs(data.draws, 5);

  const bonusSuffix = hasBonus ? ` + ${bonusLabel} ${latest.bonusNumber}` : '';

  return `=== ${name.toUpperCase()} DATA ===
Latest draw (${latest.date}): ${latest.numbers.join(', ')}${bonusSuffix}
Last 5 draws:
${last5.map((d) => `  ${d.date}: ${d.numbers.join(', ')}${hasBonus ? ` + ${bonusLabel} ${d.bonusNumber}` : ''}`).join('\n')}
Hot numbers (last 100 draws): ${hot.map((n) => `#${n.number}(${n.count}x)`).join(', ')}
Cold numbers (last 100 draws): ${cold.map((n) => `#${n.number}(${n.count}x)`).join(', ')}
Most overdue: ${overdue.map((n) => `#${n.number}(${n.drawsSince} draws)`).join(', ')}
Top pairs (last 200 draws): ${pairs.map((p) => `[${p.pair}](${p.count}x)`).join(', ')}
Total draws in database: ${data.draws.length}`;
}

// ---------------------------------------------------------------------------
// JSON parsing with sanitization (handles malformed Claude output)
// ---------------------------------------------------------------------------

function parseBlogJson(text: string): BlogPost {
  // 1. Try direct parse
  try {
    return JSON.parse(text);
  } catch { /* fall through */ }

  // 2. Strip markdown fences and try again
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch { /* fall through */ }
  }

  // 3. Extract the outermost JSON object
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (!braceMatch) {
    throw new Error(`No JSON object found in response: ${text.slice(0, 200)}`);
  }
  const raw = braceMatch[0];

  try {
    return JSON.parse(raw);
  } catch { /* fall through */ }

  // 4. Attempt to repair: extract fields individually
  // Claude commonly produces unescaped quotes inside the HTML content field
  const extractField = (name: string): string => {
    const re = new RegExp(`"${name}"\\s*:\\s*"`, 'g');
    const m = re.exec(raw);
    if (!m) return '';
    const start = re.lastIndex;
    // Walk forward to find the closing " that's followed by , or }
    let i = start;
    while (i < raw.length) {
      if (raw[i] === '\\') { i += 2; continue; }
      if (raw[i] === '"') {
        // Check if this quote is followed by optional whitespace + , or }
        const rest = raw.slice(i + 1).trimStart();
        if (rest.startsWith(',') || rest.startsWith('}')) {
          return raw.slice(start, i);
        }
      }
      i++;
    }
    return raw.slice(start);
  };

  const slug = extractField('slug');
  const title = extractField('title');
  const description = extractField('description');
  const category = extractField('category');
  const content = extractField('content');

  if (!slug || !title || !content) {
    throw new Error(`Failed to parse blog JSON after all attempts: ${raw.slice(0, 300)}`);
  }

  return { slug, title, description, category, content, date: '' };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Guard: API key required
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set – skipping blog generation.');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const outputDir = path.join(process.cwd(), 'content', 'blog');
  fs.mkdirSync(outputDir, { recursive: true });

  // Guard: skip if we already generated a post today
  const existing = fs.readdirSync(outputDir).filter((f) => f.endsWith('.json'));
  for (const f of existing) {
    if (f.includes(today)) {
      console.log(`Post for ${today} already exists – skipping.`);
      return;
    }
  }

  // Build analysis sections for all active games (skip retired games)
  const activeGames = GAMES.filter(g => {
    if (isGameRetired(g.slug)) {
      console.log(`Skipping ${g.name} (retired ${KNOWN_DATASETS[g.slug]?.retiredDate})`);
      return false;
    }
    return true;
  });

  const gameSections = activeGames
    .map(g => buildGameAnalysis(g.slug, g.name, g.maxMain, g.hasBonus, g.bonusLabel))
    .filter(Boolean)
    .join('\n\n');

  if (!gameSections) {
    console.log('No lottery data available – skipping blog generation.');
    return;
  }

  const topic = getTopicForToday();
  const targetKeyword = getTargetKeywordForToday();
  const existingTitles = getExistingTitles().slice(-30);

  // Build prompt
  const prompt = `You are a lottery statistics blogger for MyLottoStats.com, an SEO-optimized lottery information website.

Generate a unique, data-driven blog post based on the data and topic below.

RULES:
- Write 500-700 words of engaging, SEO-friendly content
- Use data-driven language: "analysis", "trends", "patterns", "insights", "frequency data"
- NEVER use: "prediction", "guaranteed", "winning strategy", "will win", "sure to hit"
- Reference SPECIFIC numbers and statistics from the data provided
- Always end with a brief disclaimer paragraph that lottery outcomes are random and analysis is for entertainment purposes only
- Make the title unique — do NOT reuse any title from the existing titles list
- Use proper HTML tags: h2, h3, p, ul, li, ol, strong, em
- Make it informative and interesting for lottery enthusiasts
- Cover multiple games when relevant, not just Powerball and Mega Millions
- Naturally incorporate this SEO target keyword at least once: "${targetKeyword}"
- Include 2-3 internal links where relevant using these paths:
  - /powerball/statistics, /mega-millions/statistics (for statistics references)
  - /tools/tax-calculator (for tax-related content)
  - /states (for state-specific content)
  - /powerball/numbers, /mega-millions/numbers (for number analysis references)
  Format: <a href="/path">descriptive anchor text</a>

TODAY'S DATE: ${today}
TOPIC FOCUS: ${topic}

${gameSections}

=== EXISTING POST TITLES (do NOT reuse these) ===
${existingTitles.map((t) => `- ${t}`).join('\n') || '(none yet)'}

Respond with ONLY valid JSON (no markdown fences, no explanation) in this exact format:
{
  "slug": "lowercase-hyphenated-slug-including-date-${today}",
  "title": "Unique SEO Title Under 70 Characters",
  "description": "Meta description under 160 characters",
  "category": "Draw Recap | Weekly Analysis | Statistics | Number Trends | Deep Dive | Tax Analysis | Game Comparison",
  "content": "<h2>First Section</h2><p>Content...</p>"
}`;

  console.log(`Generating blog post for ${today} (topic: ${topic})...`);

  const client = new Anthropic();

  // Wrap API call + JSON parsing together in retry so malformed JSON triggers a retry
  const post = await withRetry(
    async () => {
      const message = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = message.content.find(b => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('Claude response contains no text block');
      }

      return parseBlogJson(textBlock.text);
    },
    { ...RETRY_PRESETS.CLAUDE_API, maxAttempts: 3, label: 'Claude blog generation + parse' }
  );

  // Validate required fields
  const requiredFields = ['slug', 'title', 'description', 'category', 'content'] as const;
  for (const field of requiredFields) {
    if (!post[field] || typeof post[field] !== 'string' || post[field].trim() === '') {
      console.error(`Blog post missing or empty required field: ${field}`);
      process.exit(1);
    }
  }

  // Content quality validation
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  if (wordCount < BLOG_MIN_WORDS) {
    console.error(`Blog post too short: ${wordCount} words (minimum: ${BLOG_MIN_WORDS})`);
    process.exit(1);
  }

  const contentLower = post.content.toLowerCase();
  for (const term of BLOG_FORBIDDEN_TERMS) {
    if (contentLower.includes(term)) {
      console.error(`Blog post contains forbidden term: "${term}" — rewrite needed`);
      process.exit(1);
    }
  }

  // Enforce today's date
  post.date = today;

  // Ensure slug contains date for uniqueness
  if (!post.slug.endsWith(today) && !post.slug.includes(`-${today}`)) {
    post.slug = `${post.slug}-${today}`;
  }

  // Check for slug collisions against existing posts
  const existingSlugs = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
  if (existingSlugs.includes(post.slug)) {
    console.log(`Slug collision detected: ${post.slug} — appending timestamp`);
    post.slug = `${post.slug}-${Date.now()}`;
  }

  const outputPath = path.join(outputDir, `${post.slug}.json`);
  if (fs.existsSync(outputPath)) {
    console.log(`File already exists: ${outputPath} – skipping.`);
    return;
  }

  fs.writeFileSync(outputPath, JSON.stringify(post, null, 2));
  console.log(`Generated: "${post.title}"`);
  console.log(`  Slug: ${post.slug}`);
  console.log(`  Category: ${post.category}`);
  console.log(`  Saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error('Blog generation failed:', err);
  process.exit(1);
});
