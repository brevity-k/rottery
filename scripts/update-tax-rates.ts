/**
 * Auto-update state tax rates using Claude API
 *
 * Run: ANTHROPIC_API_KEY=sk-... npx tsx scripts/update-tax-rates.ts
 *
 * Uses Claude to research current state tax rates and compare against
 * the existing state-tax-rates.ts file. If changes are detected,
 * updates the file.
 *
 * Designed to run quarterly via GitHub Actions.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { withRetry } from './lib/retry';
import { CLAUDE_MODEL, RETRY_PRESETS } from './lib/constants';

interface TaxRateUpdate {
  abbreviation: string;
  name: string;
  currentRate: number;
  suggestedRate: number;
  reason: string;
}

/** Sanity bounds: no US state exceeds ~13.3% tax on lottery winnings. */
const MAX_RATE = 0.15;
/** Reject changes larger than 3 percentage points (likely hallucination). */
const MAX_CHANGE_PP = 0.03;

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set – skipping tax rate update.');
    return;
  }

  const taxFilePath = path.join(process.cwd(), 'src', 'data', 'state-tax-rates.ts');
  const currentContent = fs.readFileSync(taxFilePath, 'utf-8');

  // Extract current rates from the file
  const rateRegex = /name:\s*'([^']+)'[^}]*abbreviation:\s*'([^']+)'[^}]*taxRate:\s*([\d.]+)/g;
  const currentRates: { name: string; abbreviation: string; rate: number }[] = [];
  let match;
  while ((match = rateRegex.exec(currentContent)) !== null) {
    currentRates.push({
      name: match[1],
      abbreviation: match[2],
      rate: parseFloat(match[3]),
    });
  }

  console.log(`Found ${currentRates.length} states in current file`);

  const prompt = `You are a tax research assistant. I need you to verify the current state tax rates on lottery winnings for all US states.

Here are the current rates in our database:
${currentRates.map(s => `${s.name} (${s.abbreviation}): ${(s.rate * 100).toFixed(4)}%`).join('\n')}

Please check if any of these rates are incorrect or outdated for the current year (2026).

IMPORTANT RULES:
- Only report CONFIRMED changes. Do not guess.
- Focus on state income tax rates that apply to lottery winnings
- Some states have no income tax (AK, FL, NH, SD, TN, TX, WA, WY) - their rate should be 0
- California does not tax lottery winnings - rate should be 0
- Report rates as decimal fractions (e.g., 0.05 for 5%)

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "updates": [
    {
      "abbreviation": "XX",
      "name": "State Name",
      "currentRate": 0.05,
      "suggestedRate": 0.055,
      "reason": "Brief explanation of why the rate changed"
    }
  ],
  "noChanges": true/false,
  "notes": "Any general observations"
}

If no changes are needed, return {"updates": [], "noChanges": true, "notes": "All rates are current"}`;

  console.log('Querying Claude for tax rate verification...');

  const client = new Anthropic();
  const message = await withRetry(
    () => client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
    { ...RETRY_PRESETS.CLAUDE_API, label: 'Claude tax rate query' }
  );

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  let result: { updates: TaxRateUpdate[]; noChanges: boolean; notes: string };
  try {
    result = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      console.error('Failed to parse response:', text.slice(0, 200));
      return;
    }
  }

  console.log(`Notes: ${result.notes}`);

  if (result.noChanges || result.updates.length === 0) {
    console.log('No tax rate changes detected. All rates are current.');
    return;
  }

  console.log(`\nSuggested updates (${result.updates.length}):`);
  const lines = currentContent.split('\n');
  let changesApplied = 0;

  for (const update of result.updates) {
    console.log(`  ${update.name} (${update.abbreviation}): ${update.currentRate} -> ${update.suggestedRate} (${update.reason})`);

    // Sanity bound: reject rates outside [0, MAX_RATE]
    if (update.suggestedRate < 0 || update.suggestedRate > MAX_RATE) {
      console.log(`    REJECTED: Rate ${update.suggestedRate} outside bounds [0, ${MAX_RATE}]`);
      continue;
    }

    // Sanity bound: reject changes > MAX_CHANGE_PP
    const changePP = Math.abs(update.suggestedRate - update.currentRate);
    if (changePP > MAX_CHANGE_PP) {
      console.log(`    REJECTED: Change of ${(changePP * 100).toFixed(2)}pp exceeds max ${(MAX_CHANGE_PP * 100).toFixed(0)}pp`);
      continue;
    }

    // Line-based editing: find the state block, then update its taxRate line
    let stateLineIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`abbreviation: '${update.abbreviation}'`)) {
        stateLineIdx = i;
        break;
      }
    }

    if (stateLineIdx === -1) {
      console.log(`    WARNING: Could not find abbreviation '${update.abbreviation}' in file`);
      continue;
    }

    // Search forward from the abbreviation line for the taxRate line (within the same block)
    let found = false;
    for (let j = stateLineIdx; j < Math.min(stateLineIdx + 15, lines.length); j++) {
      const taxRateMatch = lines[j].match(/^(\s*taxRate:\s*)[\d.]+(.*)$/);
      if (taxRateMatch) {
        lines[j] = `${taxRateMatch[1]}${update.suggestedRate}${taxRateMatch[2]}`;
        changesApplied++;
        found = true;
        break;
      }
      // Stop if we hit the next state block (closing brace followed by opening brace or another abbreviation)
      if (j > stateLineIdx && lines[j].includes('abbreviation:')) break;
    }

    if (!found) {
      console.log(`    WARNING: Could not find taxRate line for ${update.abbreviation}`);
    }
  }

  if (changesApplied > 0) {
    fs.writeFileSync(taxFilePath, lines.join('\n'));
    console.log(`\nApplied ${changesApplied} tax rate update(s) to state-tax-rates.ts`);
  } else {
    console.log('\nNo changes could be applied (all rejected or not matched).');
  }
}

main().catch((err) => {
  console.error('update-tax-rates failed:', err);
  process.exit(1);
});
