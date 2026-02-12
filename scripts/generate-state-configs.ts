/**
 * Auto-generate StateConfig entries for states that have lotteries but
 * are not yet in src/lib/states/config.ts.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-state-configs.ts
 *
 * Reads state-tax-rates.ts for the full state list, reads config.ts for
 * existing entries, and uses Claude to generate accurate configs for missing
 * states. Appends new entries via line-based file editing.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { withRetry } from './lib/retry';
import { CLAUDE_MODEL } from './lib/constants';

const ROOT = process.cwd();
const TAX_FILE = path.join(ROOT, 'src', 'data', 'state-tax-rates.ts');
const CONFIG_FILE = path.join(ROOT, 'src', 'lib', 'states', 'config.ts');

// Known game slugs that states can have
const KNOWN_GAME_SLUGS = ['powerball', 'mega-millions', 'cash4life', 'ny-lotto', 'take5'];

interface StateTaxEntry {
  name: string;
  abbreviation: string;
  slug: string;
  hasLottery: boolean;
  taxRate: number;
}

interface GeneratedStateConfig {
  name: string;
  abbreviation: string;
  slug: string;
  availableGames: string[];
  taxRate: number;
  taxNotes: string;
  lotteryWebsite: string;
  claimInfo: string;
  purchaseAge: number;
  facts: string[];
}

// ---------------------------------------------------------------------------
// Parse existing states from config.ts
// ---------------------------------------------------------------------------

function getExistingStateSlugs(): string[] {
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  // Match both quoted and unquoted object keys: 'new-york': { or california: {
  // Only match keys at 2-space indent level (direct children of stateConfigs)
  const matches = content.matchAll(/^ {2}(?:'([a-z-]+)'|([a-z]+)):\s*\{/gm);
  const slugs: string[] = [];
  for (const m of matches) {
    const slug = m[1] || m[2];
    if (slug) slugs.push(slug);
  }
  return slugs;
}

// ---------------------------------------------------------------------------
// Parse state tax data to identify missing lottery states
// ---------------------------------------------------------------------------

function parseTaxData(): StateTaxEntry[] {
  const content = fs.readFileSync(TAX_FILE, 'utf-8');
  const entries: StateTaxEntry[] = [];

  // Match each entry in the stateTaxData array
  const entryRegex = /\{\s*name:\s*'([^']+)',\s*abbreviation:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*hasLottery:\s*(true|false),\s*taxRate:\s*([\d.]+)/g;
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    entries.push({
      name: match[1],
      abbreviation: match[2],
      slug: match[3],
      hasLottery: match[4] === 'true',
      taxRate: parseFloat(match[5]),
    });
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Validate a generated config
// ---------------------------------------------------------------------------

function validateConfig(config: GeneratedStateConfig, taxEntry: StateTaxEntry): string[] {
  const errors: string[] = [];

  if (![18, 21].includes(config.purchaseAge)) {
    errors.push(`purchaseAge ${config.purchaseAge} is not 18 or 21`);
  }

  if (!config.lotteryWebsite.startsWith('https://')) {
    errors.push(`lotteryWebsite "${config.lotteryWebsite}" must start with https://`);
  }

  // All lottery states get at least PB + MM
  if (!config.availableGames.includes('powerball') || !config.availableGames.includes('mega-millions')) {
    errors.push(`availableGames must include at least powerball and mega-millions`);
  }

  for (const game of config.availableGames) {
    if (!KNOWN_GAME_SLUGS.includes(game)) {
      errors.push(`Unknown game slug "${game}"`);
    }
  }

  // Cross-validate tax rate
  if (Math.abs(config.taxRate - taxEntry.taxRate) > 0.001) {
    errors.push(`taxRate ${config.taxRate} does not match state-tax-rates.ts value ${taxEntry.taxRate}`);
  }

  if (!config.facts || config.facts.length < 3) {
    errors.push(`Expected at least 3 facts, got ${config.facts?.length || 0}`);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Generate configs via Claude API
// ---------------------------------------------------------------------------

async function generateConfigsBatch(
  states: StateTaxEntry[],
  existingExample: string,
  client: Anthropic
): Promise<GeneratedStateConfig[]> {
  const stateList = states.map(s =>
    `- ${s.name} (${s.abbreviation}), slug: "${s.slug}", taxRate: ${s.taxRate}`
  ).join('\n');

  const prompt = `You are generating accurate US state lottery configuration data for a lottery statistics website.

For each state below, generate a StateConfig object with:
- name, abbreviation, slug (as provided)
- availableGames: array of game slugs from this list ONLY: ${JSON.stringify(KNOWN_GAME_SLUGS)}
  - All lottery states participate in "powerball" and "mega-millions"
  - Only include "cash4life" for states that actually sell Cash4Life tickets (mostly northeastern US)
  - Only include "ny-lotto" and "take5" for New York
- taxRate: MUST match the exact value provided for each state (this is already verified data)
- taxNotes: One sentence about the state's lottery tax situation
- lotteryWebsite: The official state lottery website URL (must start with https://)
- claimInfo: 2-3 sentence summary of prize claim procedures (small prizes at retailers, larger prizes at lottery offices, biggest prizes at headquarters)
- purchaseAge: 18 for most states, 21 for Arizona, Iowa, Louisiana, and Nebraska
- facts: Array of 4 brief facts about this state's lottery

Here are existing configs as format examples:
${existingExample}

STATES TO GENERATE:
${stateList}

Respond with ONLY valid JSON array (no markdown fences, no explanation):
[
  {
    "name": "...",
    "abbreviation": "...",
    "slug": "...",
    "availableGames": ["powerball", "mega-millions"],
    "taxRate": 0.0,
    "taxNotes": "...",
    "lotteryWebsite": "https://...",
    "claimInfo": "...",
    "purchaseAge": 18,
    "facts": ["...", "...", "...", "..."]
  }
]`;

  const message = await withRetry(
    () => client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
    { maxAttempts: 2, baseDelayMs: 3000, label: `Claude state config generation (${states.length} states)` }
  );

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error(`Failed to parse response as JSON: ${text.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// Append configs to file
// ---------------------------------------------------------------------------

function appendConfigsToFile(configs: GeneratedStateConfig[]) {
  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const lines = content.split('\n');

  // Find the closing of stateConfigs object: the line with just `};`
  // that comes after all the state entries
  let insertIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '};') {
      insertIndex = i;
      break;
    }
  }

  if (insertIndex === -1) {
    throw new Error('Could not find closing }; of stateConfigs in config.ts');
  }

  // Generate TypeScript for each config
  const newEntries = configs.map(c => {
    const gamesStr = c.availableGames.map(g => `'${g}'`).join(', ');
    const factsStr = c.facts.map(f => `      '${f.replace(/'/g, "\\'")}',`).join('\n');
    const taxNotesLine = c.taxNotes ? `\n    taxNotes: '${c.taxNotes.replace(/'/g, "\\'")}',` : '';

    return `  '${c.slug}': {
    name: '${c.name}',
    abbreviation: '${c.abbreviation}',
    slug: '${c.slug}',
    availableGames: [${gamesStr}],
    taxRate: ${c.taxRate},${taxNotesLine}
    lotteryWebsite: '${c.lotteryWebsite}',
    claimInfo: '${c.claimInfo.replace(/'/g, "\\'")}',
    purchaseAge: ${c.purchaseAge},
    facts: [
${factsStr}
    ],
  },`;
  });

  lines.splice(insertIndex, 0, ...newEntries.map(e => e));
  fs.writeFileSync(CONFIG_FILE, lines.join('\n'));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set — skipping state config generation.');
    return;
  }

  const existingSlugs = getExistingStateSlugs();
  const allStates = parseTaxData();
  const missingStates = allStates.filter(s => s.hasLottery && !existingSlugs.includes(s.slug));

  if (missingStates.length === 0) {
    console.log('All lottery states already have configs — nothing to generate.');
    return;
  }

  console.log(`Found ${missingStates.length} lottery states without configs:`);
  missingStates.forEach(s => console.log(`  - ${s.name} (${s.slug})`));

  // Read existing config as example (take first 2 entries)
  const configContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const exampleMatch = configContent.match(/california:[\s\S]*?^\s\s\},\n\s\stexas:[\s\S]*?^\s\s\},/m);
  const existingExample = exampleMatch ? exampleMatch[0] : '';

  const client = new Anthropic();
  const allConfigs: GeneratedStateConfig[] = [];

  // Process in batches of 5
  for (let i = 0; i < missingStates.length; i += 5) {
    const batch = missingStates.slice(i, i + 5);
    console.log(`\nGenerating batch ${Math.floor(i / 5) + 1} (${batch.map(s => s.abbreviation).join(', ')})...`);

    const configs = await generateConfigsBatch(batch, existingExample, client);

    for (const config of configs) {
      const taxEntry = missingStates.find(s => s.slug === config.slug);
      if (!taxEntry) {
        console.warn(`  Skipping unknown slug: ${config.slug}`);
        continue;
      }

      // Force correct tax rate
      config.taxRate = taxEntry.taxRate;

      // Force at minimum PB + MM
      if (!config.availableGames.includes('powerball')) config.availableGames.unshift('powerball');
      if (!config.availableGames.includes('mega-millions')) {
        const pbIdx = config.availableGames.indexOf('powerball');
        config.availableGames.splice(pbIdx + 1, 0, 'mega-millions');
      }

      // Filter to known games only
      config.availableGames = config.availableGames.filter(g => KNOWN_GAME_SLUGS.includes(g));

      // Only NY gets ny-lotto and take5
      if (config.slug !== 'new-york') {
        config.availableGames = config.availableGames.filter(g => g !== 'ny-lotto' && g !== 'take5');
      }

      const errors = validateConfig(config, taxEntry);
      if (errors.length > 0) {
        console.warn(`  Validation warnings for ${config.name}:`);
        errors.forEach(e => console.warn(`    - ${e}`));
        // Fix purchaseAge if invalid
        if (![18, 21].includes(config.purchaseAge)) {
          config.purchaseAge = ['arizona', 'iowa', 'louisiana', 'nebraska'].includes(config.slug) ? 21 : 18;
        }
        // Fix lotteryWebsite if invalid
        if (!config.lotteryWebsite.startsWith('https://')) {
          config.lotteryWebsite = `https://${config.lotteryWebsite}`;
        }
      }

      allConfigs.push(config);
      console.log(`  ${config.name}: ${config.availableGames.length} games, ${config.purchaseAge}+, ${config.lotteryWebsite}`);
    }
  }

  if (allConfigs.length === 0) {
    console.log('\nNo valid configs generated.');
    return;
  }

  console.log(`\nAppending ${allConfigs.length} new state configs to ${CONFIG_FILE}...`);
  appendConfigsToFile(allConfigs);
  console.log('Done. Run `npm run build` to verify.');
}

main().catch((err) => {
  console.error('State config generation failed:', err);
  process.exit(1);
});
