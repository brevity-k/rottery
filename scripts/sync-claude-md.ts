/**
 * Syncs dynamic statistics in CLAUDE.md with actual values.
 *
 * Updates:
 * - State count (number of state configs)
 * - Draw counts per game (from JSON data files)
 * - Page count estimate
 *
 * Usage: npx tsx scripts/sync-claude-md.ts
 *
 * Idempotent — no changes if values already match.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CLAUDE_MD = path.join(ROOT, 'CLAUDE.md');

interface Replacement {
  pattern: RegExp;
  replacement: string;
  label: string;
}

function countBlogPosts(): number {
  const blogDir = path.join(ROOT, 'content', 'blog');
  const seedPostCount = 8; // Hardcoded seed posts in src/lib/blog.ts
  let generated = 0;
  try {
    generated = fs.readdirSync(blogDir).filter(f => f.endsWith('.json')).length;
  } catch {
    // Directory may not exist
  }
  return seedPostCount + generated;
}

function countStates(): number {
  const configPath = path.join(ROOT, 'src', 'lib', 'states', 'config.ts');
  const content = fs.readFileSync(configPath, 'utf-8');
  // Count state entries by matching the pattern: slug: { or 'slug': {
  // These are indented with 2 spaces inside the stateConfigs object
  const matches = content.match(/^\s{2}(?:'[a-z-]+'|[a-z]+):\s*\{/gm);
  return matches ? matches.length : 0;
}

function getDrawCount(filename: string): number {
  const filePath = path.join(ROOT, 'src', 'data', filename);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return data.draws?.length || 0;
  } catch {
    return 0;
  }
}

function estimatePageCount(): number {
  // Static pages: home, about, privacy, terms, disclaimer, contact, blog index,
  // tools (4), states index, methodology = ~13
  const staticPages = 13;

  // Lottery pages: 5 games × 4 pages (overview, numbers, results, statistics) = 20
  const lotteryMainPages = 20;

  // Year archive pages: rough estimate
  const yearPages = 5 * 20; // ~20 years per game

  // Number analysis pages: calculated from config
  const configPath = path.join(ROOT, 'src', 'lib', 'lotteries', 'config.ts');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  // Count main numbers pages and bonus pages
  const mainMaxes = configContent.match(/mainNumbers:\s*\{\s*count:\s*\d+,\s*max:\s*(\d+)/g) || [];
  const bonusMaxes = configContent.match(/bonusNumber:\s*\{\s*count:\s*(\d+),\s*max:\s*(\d+)/g) || [];
  let numberPages = 0;
  for (const m of mainMaxes) {
    const match = m.match(/max:\s*(\d+)/);
    if (match) numberPages += parseInt(match[1], 10);
  }
  for (const m of bonusMaxes) {
    const countMatch = m.match(/count:\s*(\d+)/);
    const maxMatch = m.match(/max:\s*(\d+)/);
    if (countMatch && maxMatch && parseInt(countMatch[1], 10) > 0) {
      numberPages += parseInt(maxMatch[1], 10);
    }
  }

  const statePages = countStates();
  const blogPages = countBlogPosts();

  return staticPages + lotteryMainPages + yearPages + numberPages + statePages + blogPages;
}

function main() {
  if (!fs.existsSync(CLAUDE_MD)) {
    console.log('CLAUDE.md not found — skipping sync.');
    return;
  }

  let content = fs.readFileSync(CLAUDE_MD, 'utf-8');
  const original = content;

  const stateCount = countStates();
  const pbDraws = getDrawCount('powerball.json');
  const mmDraws = getDrawCount('mega-millions.json');
  const c4lDraws = getDrawCount('cash4life.json');
  const nylDraws = getDrawCount('ny-lotto.json');
  const t5Draws = getDrawCount('take5.json');
  const pageEstimate = estimatePageCount();

  const replacements: Replacement[] = [
    // Update draw counts in project structure section
    {
      pattern: /powerball\.json\s+#\s*~[\d,]+ draws/,
      replacement: `powerball.json           # ~${pbDraws.toLocaleString()} draws`,
      label: 'Powerball JSON comment',
    },
    {
      pattern: /mega-millions\.json\s+#\s*~[\d,]+ draws/,
      replacement: `mega-millions.json       # ~${mmDraws.toLocaleString()} draws`,
      label: 'Mega Millions JSON comment',
    },
    {
      pattern: /cash4life\.json\s+#\s*~[\d,]+ draws/,
      replacement: `cash4life.json           # ~${c4lDraws.toLocaleString()} draws`,
      label: 'Cash4Life JSON comment',
    },
    {
      pattern: /ny-lotto\.json\s+#\s*~[\d,]+ draws/,
      replacement: `ny-lotto.json            # ~${nylDraws.toLocaleString()} draws`,
      label: 'NY Lotto JSON comment',
    },
    {
      pattern: /take5\.json\s+#\s*~[\d,]+ draws/,
      replacement: `take5.json               # ~${t5Draws.toLocaleString()} draws`,
      label: 'Take 5 JSON comment',
    },
    // Update build comment page count
    {
      pattern: /npm run build\s+# Build for production \(~\d+ pages\)/,
      replacement: `npm run build                  # Build for production (~${pageEstimate} pages)`,
      label: 'Build comment page count',
    },
  ];

  // Apply specific pattern replacements
  let changes = 0;
  let warnings = 0;
  for (const r of replacements) {
    if (!r.pattern.test(content)) {
      console.warn(`  ⚠ Pattern not found: ${r.label} — CLAUDE.md format may have changed`);
      warnings++;
      continue;
    }
    const before = content;
    content = content.replace(r.pattern, r.replacement);
    if (content !== before) {
      console.log(`  Updated: ${r.label}`);
      changes++;
    }
  }

  // Update page count in header
  const pageCountPattern = /\*\*Current page count:\*\*\s*\d+ static pages/;
  const newPageLine = `**Current page count:** ${pageEstimate} static pages`;
  if (pageCountPattern.test(content)) {
    const before = content;
    content = content.replace(pageCountPattern, newPageLine);
    if (content !== before) {
      console.log(`  Updated: page count → ${pageEstimate}`);
      changes++;
    }
  }

  // Update "10 states" references in specific contexts (state hub section)
  const stateHubPattern = /\b(\d+) state hub pages\b/;
  if (stateHubPattern.test(content)) {
    const before = content;
    content = content.replace(stateHubPattern, `${stateCount} state hub pages`);
    if (content !== before) {
      console.log(`  Updated: state hub pages → ${stateCount}`);
      changes++;
    }
  }

  if (content !== original) {
    fs.writeFileSync(CLAUDE_MD, content);
    console.log(`\nCLAUDE.md updated with ${changes} change(s).`);
  } else {
    console.log('\nCLAUDE.md already up to date — no changes needed.');
  }

  if (warnings > 0) {
    console.warn(`\n${warnings} pattern(s) not found — CLAUDE.md may need manual review.`);
  }
}

try {
  main();
} catch (err) {
  console.error('sync-claude-md failed:', err);
  process.exit(1);
}
