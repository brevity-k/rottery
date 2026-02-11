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

// ---------------------------------------------------------------------------
// Types (self-contained – no @/ imports so tsx can run standalone)
// ---------------------------------------------------------------------------

interface DrawResult {
  date: string;
  numbers: number[];
  bonusNumber: number;
  multiplier?: number;
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

function loadLotteryData(slug: string): LotteryData {
  const filePath = path.join(process.cwd(), 'src', 'data', `${slug}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
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
// Topic rotation (7 topics, one per day-of-week)
// ---------------------------------------------------------------------------

const TOPICS = [
  'Recap and analysis of the latest Powerball Saturday draw results',
  'Weekly hot and cold number trends across Powerball and Mega Millions',
  'Analysis of the latest Powerball Monday draw and emerging patterns',
  'Mega Millions draw analysis and statistical trends',
  'Deep dive into overdue numbers that are statistically due',
  'Number pair spotlight: which combinations appear together most often',
  'Mega Millions Friday draw recap and weekend lottery outlook',
] as const;

function getTopicForToday(): string {
  return TOPICS[new Date().getDay()];
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

  // Load lottery data
  const pbData = loadLotteryData('powerball');
  const mmData = loadLotteryData('mega-millions');

  // Build analysis context
  const ctx = {
    today,
    topic: getTopicForToday(),
    powerball: {
      latest: pbData.draws[0],
      last5: pbData.draws.slice(0, 5),
      hot: getHotNumbers(pbData.draws, 69, 10),
      cold: getColdNumbers(pbData.draws, 69, 10),
      overdue: getOverdueNumbers(pbData.draws, 69, 10),
      pairs: getTopPairs(pbData.draws, 5),
      totalDraws: pbData.draws.length,
    },
    megaMillions: {
      latest: mmData.draws[0],
      last5: mmData.draws.slice(0, 5),
      hot: getHotNumbers(mmData.draws, 70, 10),
      cold: getColdNumbers(mmData.draws, 70, 10),
      overdue: getOverdueNumbers(mmData.draws, 70, 10),
      pairs: getTopPairs(mmData.draws, 5),
      totalDraws: mmData.draws.length,
    },
    existingTitles: getExistingTitles().slice(-30),
  };

  // Build prompt
  const prompt = `You are a lottery statistics blogger for Rottery.com, an SEO-optimized lottery information website.

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

TODAY'S DATE: ${ctx.today}
TOPIC FOCUS: ${ctx.topic}

=== POWERBALL DATA ===
Latest draw (${ctx.powerball.latest.date}): ${ctx.powerball.latest.numbers.join(', ')} + PB ${ctx.powerball.latest.bonusNumber}
Last 5 draws:
${ctx.powerball.last5.map((d) => `  ${d.date}: ${d.numbers.join(', ')} + PB ${d.bonusNumber}`).join('\n')}
Hot numbers (last 100 draws): ${ctx.powerball.hot.map((n) => `#${n.number}(${n.count}x)`).join(', ')}
Cold numbers (last 100 draws): ${ctx.powerball.cold.map((n) => `#${n.number}(${n.count}x)`).join(', ')}
Most overdue: ${ctx.powerball.overdue.map((n) => `#${n.number}(${n.drawsSince} draws)`).join(', ')}
Top pairs (last 200 draws): ${ctx.powerball.pairs.map((p) => `[${p.pair}](${p.count}x)`).join(', ')}
Total draws in database: ${ctx.powerball.totalDraws}

=== MEGA MILLIONS DATA ===
Latest draw (${ctx.megaMillions.latest.date}): ${ctx.megaMillions.latest.numbers.join(', ')} + MB ${ctx.megaMillions.latest.bonusNumber}
Last 5 draws:
${ctx.megaMillions.last5.map((d) => `  ${d.date}: ${d.numbers.join(', ')} + MB ${d.bonusNumber}`).join('\n')}
Hot numbers (last 100 draws): ${ctx.megaMillions.hot.map((n) => `#${n.number}(${n.count}x)`).join(', ')}
Cold numbers (last 100 draws): ${ctx.megaMillions.cold.map((n) => `#${n.number}(${n.count}x)`).join(', ')}
Most overdue: ${ctx.megaMillions.overdue.map((n) => `#${n.number}(${n.drawsSince} draws)`).join(', ')}
Top pairs (last 200 draws): ${ctx.megaMillions.pairs.map((p) => `[${p.pair}](${p.count}x)`).join(', ')}
Total draws in database: ${ctx.megaMillions.totalDraws}

=== EXISTING POST TITLES (do NOT reuse these) ===
${ctx.existingTitles.map((t) => `- ${t}`).join('\n') || '(none yet)'}

Respond with ONLY valid JSON (no markdown fences, no explanation) in this exact format:
{
  "slug": "lowercase-hyphenated-slug-including-date-${ctx.today}",
  "title": "Unique SEO Title Under 70 Characters",
  "description": "Meta description under 160 characters",
  "category": "Draw Recap | Weekly Analysis | Statistics | Number Trends | Deep Dive",
  "content": "<h2>First Section</h2><p>Content...</p>"
}`;

  console.log(`Generating blog post for ${today} (topic: ${ctx.topic})...`);

  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  let post: BlogPost;
  try {
    post = JSON.parse(text);
  } catch (e) {
    // Try extracting JSON from possible markdown fences
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      post = JSON.parse(match[0]);
    } else {
      console.error('Failed to parse response as JSON:', text.slice(0, 200));
      process.exit(1);
    }
  }

  // Enforce today's date
  post.date = today;

  // Ensure slug contains date for uniqueness
  if (!post.slug.includes(today)) {
    post.slug = `${post.slug}-${today}`;
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
