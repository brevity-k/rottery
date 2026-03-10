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
  { slug: 'millionaire-for-life', name: 'Millionaire for Life', maxMain: 58, hasBonus: true, bonusLabel: 'ML' },
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
  const month = now.getMonth() + 1;
  const yearMonth = now.toISOString().slice(0, 7);

  // Check special/seasonal overrides first (roughly every 4th week)
  const weekOfYear = getWeekOfYear(now);
  if (weekOfYear % 4 === 0) {
    if (SPECIAL_TOPICS[yearMonth]) return SPECIAL_TOPICS[yearMonth];
    if (SEASONAL_OVERRIDES[month]) return SEASONAL_OVERRIDES[month];
  }

  // Weekly rotation through 8 topics
  return TOPICS[weekOfYear % TOPICS.length];
}

function getTargetKeywordForToday(): string {
  const weekOfYear = getWeekOfYear(new Date());
  return TARGET_KEYWORDS[weekOfYear % TARGET_KEYWORDS.length];
}

function getWeekOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;
  return Math.ceil(dayOfYear / 7);
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
  const prompt = `You are a sharp, opinionated lottery statistics writer for MyLottoStats.com. You write like a smart friend explaining interesting things — conversational, surprising, data-backed, never boring.

Write a blog post based on the topic and data below.

VOICE & STYLE:
- Open with a hook that makes the reader curious (a question, a surprising fact, a "what if" scenario)
- Write like you're telling a friend something fascinating — not writing a textbook
- Use specific numbers from the data (not vague "some numbers are hot")
- Have a point of view. Say "this is surprising" or "this matters because..." — don't just list facts
- Use short paragraphs. Mix in rhetorical questions. Keep it punchy.
- 600-900 words. Quality over length.

FORMATTING:
- Use h2 for main sections, h3 for subsections
- Use <strong> for emphasis, <em> for asides
- Include at least one HTML table (<table>) when comparing data (numbers, states, games)
- Use <blockquote> for one surprising stat or pull-quote that makes people stop and think

LINKS (include 2-3 naturally):
- <a href="/simulator">What-If Simulator</a> — our flagship tool, link when discussing hypotheticals
- <a href="/powerball/statistics">Powerball stats</a>, <a href="/mega-millions/statistics">Mega Millions stats</a>
- <a href="/tools/tax-calculator">tax calculator</a> for tax topics
- <a href="/states">state lottery guide</a> for state comparisons
- <a href="/powerball/numbers">number insights</a> for number analysis

HARD RULES:
- NEVER use: "prediction", "guaranteed", "winning strategy", "will win", "sure to hit"
- End with a 1-2 sentence disclaimer (lottery is random, this is entertainment)
- Title must be under 60 characters and make someone want to click
- Do NOT reuse any title from the existing titles list
- Naturally include this keyword once: "${targetKeyword}"

TODAY'S DATE: ${today}
TOPIC: ${topic}

${gameSections}

=== EXISTING TITLES (avoid these) ===
${existingTitles.map((t) => `- ${t}`).join('\n') || '(none yet)'}

Respond with ONLY valid JSON:
{
  "slug": "catchy-slug-${today}",
  "title": "Click-Worthy Title Under 60 Chars",
  "description": "Compelling meta description under 155 chars with a reason to click",
  "category": "What If | Weekly Trends | Deep Dive | Tax Guide | Game Comparison | Number Spotlight",
  "content": "<h2>Hook Section</h2><p>Content...</p>"
}`;

  console.log(`Generating blog post for ${today} (topic: ${topic})...`);

  const client = new Anthropic();

  // Wrap API call + JSON parsing + content validation in retry so forbidden terms
  // or quality issues trigger a fresh generation attempt instead of failing outright.
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

      const parsed = parseBlogJson(textBlock.text);

      // Validate required fields
      const requiredFields = ['slug', 'title', 'description', 'category', 'content'] as const;
      for (const field of requiredFields) {
        if (!parsed[field] || typeof parsed[field] !== 'string' || parsed[field].trim() === '') {
          throw new Error(`Blog post missing or empty required field: ${field}`);
        }
      }

      // Content quality validation
      const wordCount = parsed.content.split(/\s+/).filter(Boolean).length;
      if (wordCount < BLOG_MIN_WORDS) {
        throw new Error(`Blog post too short: ${wordCount} words (minimum: ${BLOG_MIN_WORDS})`);
      }

      const contentLower = parsed.content.toLowerCase();
      for (const term of BLOG_FORBIDDEN_TERMS) {
        if (contentLower.includes(term)) {
          throw new Error(`Blog post contains forbidden term: "${term}" — retrying generation`);
        }
      }

      return parsed;
    },
    { ...RETRY_PRESETS.CLAUDE_API, maxAttempts: 3, label: 'Claude blog generation + validate' }
  );

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
