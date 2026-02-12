/**
 * Auto-onboard a new lottery game detected by check-new-datasets.ts.
 *
 * Fetches sample data from the SODA API, analyzes the structure,
 * uses Claude to generate config entries, and creates a PR.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/onboard-new-game.ts <dataset-id>
 *
 * Example:
 *   npx tsx scripts/onboard-new-game.ts abc1-2def
 *
 * Creates a feature branch auto/add-game-<slug> and opens a PR.
 * Requires: ANTHROPIC_API_KEY, gh CLI (for PR creation)
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { withRetry } from './lib/retry';
import { CLAUDE_MODEL, RETRY_PRESETS } from './lib/constants';

const ROOT = process.cwd();
const CONFIG_FILE = path.join(ROOT, 'src', 'lib', 'lotteries', 'config.ts');
const UPDATE_DATA_FILE = path.join(ROOT, 'scripts', 'update-data.ts');

interface SodaRecord {
  [key: string]: string | number | undefined;
}

async function main() {
  const datasetId = process.argv[2];
  if (!datasetId) {
    console.error('Usage: npx tsx scripts/onboard-new-game.ts <dataset-id>');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set — skipping auto-onboarding.');
    return;
  }

  console.log(`Onboarding new game from dataset: ${datasetId}`);

  // 1. Fetch sample data
  console.log('Fetching sample data from SODA API...');
  const sampleUrl = `https://data.ny.gov/resource/${datasetId}.json?$limit=20&$order=:id DESC`;
  const response = await withRetry(
    () => fetch(sampleUrl).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r;
    }),
    { ...RETRY_PRESETS.SODA_DATA, label: 'SODA sample fetch' }
  );

  const sampleData: SodaRecord[] = await response.json();

  if (!Array.isArray(sampleData) || sampleData.length === 0) {
    console.error('No data returned from SODA API for this dataset.');
    process.exit(1);
  }

  console.log(`Fetched ${sampleData.length} sample records.`);
  console.log('Fields:', Object.keys(sampleData[0]).join(', '));

  // 2. Also fetch dataset metadata
  let datasetName = '';
  let datasetDescription = '';
  try {
    const metaUrl = `https://api.us.socrata.com/api/catalog/v1?ids=${datasetId}`;
    const metaRes = await fetch(metaUrl);
    if (metaRes.ok) {
      const metaData = await metaRes.json();
      if (metaData.results?.[0]) {
        datasetName = metaData.results[0].resource?.name || '';
        datasetDescription = metaData.results[0].resource?.description || '';
      }
    }
  } catch {
    // Non-critical
  }

  // 3. Read existing configs as examples
  const existingConfig = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const existingUpdateData = fs.readFileSync(UPDATE_DATA_FILE, 'utf-8');

  // Extract one LotteryConfig entry as example (powerball)
  const configExample = existingConfig.match(/powerball:\s*\{[\s\S]*?startYear:\s*\d+,\n\s*\}/)?.[0] || '';

  // Extract one LotterySource as example
  const sourceExample = existingUpdateData.match(/\{\s*id:\s*'powerball'[\s\S]*?staleDays:\s*\d+,?\s*\}/)?.[0] || '';

  // 4. Use Claude to analyze and generate config
  console.log('Analyzing data structure with Claude...');

  const prompt = `You are helping onboard a new lottery game into a Next.js lottery statistics website.

DATASET INFO:
- Dataset ID: ${datasetId}
- Name: ${datasetName}
- Description: ${datasetDescription}

SAMPLE DATA (first 5 records):
${JSON.stringify(sampleData.slice(0, 5), null, 2)}

ALL FIELD NAMES:
${Object.keys(sampleData[0]).join(', ')}

EXISTING LOTTERY CONFIG EXAMPLE:
${configExample}

EXISTING UPDATE-DATA SOURCE EXAMPLE:
${sourceExample}

Based on the sample data, generate:

1. A LotteryConfig object for src/lib/lotteries/config.ts
   - Determine: game name, slug, number format (main count, max, bonus count, max)
   - Determine draw days from the dates in sample data
   - Set appropriate colors
   - Map fields correctly (which field has the date, numbers, bonus)

2. A LotterySource object for scripts/update-data.ts
   - Map SODA field names to our schema
   - Set appropriate staleDays

3. Brief notes about the data format (any quirks, field naming conventions)

Respond with JSON (no markdown fences):
{
  "lotteryConfig": { ... },
  "lotterySource": { ... },
  "notes": "..."
}`;

  const client = new Anthropic();
  const message = await withRetry(
    () => client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
    { ...RETRY_PRESETS.CLAUDE_API, label: 'Claude game analysis' }
  );

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      result = JSON.parse(match[0]);
    } else {
      console.error('Failed to parse Claude response:', text.slice(0, 300));
      process.exit(1);
    }
  }

  const slug = result.lotteryConfig?.slug || result.lotteryConfig?.id || datasetId;
  const gameName = result.lotteryConfig?.name || datasetName || 'Unknown Game';

  console.log(`\nDetected game: ${gameName} (slug: ${slug})`);
  console.log('Notes:', result.notes);

  // 5. Write output files for review
  const outputDir = path.join(ROOT, '.onboarding');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${slug}-config.json`);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nConfig written to: ${outputPath}`);

  // 6. Create branch and PR (only in CI or when gh is available)
  try {
    execSync('gh --version', { stdio: 'pipe' });

    const branchName = `auto/add-game-${slug}`;
    console.log(`\nCreating branch: ${branchName}`);

    execSync(`git checkout -b ${branchName}`, { cwd: ROOT, stdio: 'pipe' });

    // Write the config file for review
    fs.writeFileSync(
      path.join(outputDir, `${slug}-README.md`),
      `# Auto-Onboarding: ${gameName}\n\n` +
      `Dataset ID: \`${datasetId}\`\n` +
      `API URL: \`https://data.ny.gov/resource/${datasetId}.json\`\n\n` +
      `## Generated Config\n\n` +
      `See \`${slug}-config.json\` for the generated LotteryConfig and LotterySource.\n\n` +
      `## Manual Steps Required\n\n` +
      `1. Add game to \`KNOWN_DATASETS\` in \`scripts/lib/constants.ts\` (single source of truth)\n` +
      `2. Add \`VALIDATION_CONFIG\` entry in \`scripts/update-data.ts\`\n` +
      `3. Add LotteryConfig to \`src/lib/lotteries/config.ts\`\n` +
      `4. Add parser handling in \`src/lib/data/parser.ts\` if needed\n` +
      `5. Add game to \`GAMES\` array in \`scripts/generate-blog-post.ts\`\n` +
      `6. Update CLAUDE.md with the new game\n` +
      `7. Run \`npx tsx scripts/update-data.ts\` to fetch initial data\n` +
      `8. Run \`npm run build\` to verify\n\n` +
      `## Claude's Notes\n\n${result.notes}\n`
    );

    execSync(`git add .onboarding/`, { cwd: ROOT, stdio: 'pipe' });
    execSync(
      `git commit -m "feat: auto-onboard ${gameName} (dataset ${datasetId})"`,
      { cwd: ROOT, stdio: 'pipe' }
    );
    execSync(`git push -u origin ${branchName}`, { cwd: ROOT, stdio: 'pipe' });

    const prBody = [
      `## Auto-Onboarding: ${gameName}`,
      '',
      `A new SODA dataset (\`${datasetId}\`) was detected by \`check-new-datasets.ts\`.`,
      '',
      `This PR contains the auto-generated config in \`.onboarding/${slug}-config.json\`.`,
      '',
      '### What\'s included',
      '- Generated `LotteryConfig` entry',
      '- Generated `LotterySource` entry',
      '- Analysis notes from Claude',
      '',
      '### Manual steps needed',
      '1. Review and integrate the generated config into the codebase',
      '2. Test with `npx tsx scripts/update-data.ts`',
      '3. Verify build with `npm run build`',
      '',
      '*Auto-generated by `scripts/onboard-new-game.ts`*',
    ].join('\n');

    execSync(
      `gh pr create --title "feat: onboard ${gameName}" --body "${prBody.replace(/"/g, '\\"')}"`,
      { cwd: ROOT, stdio: 'inherit' }
    );

    // Switch back to main
    execSync('git checkout main', { cwd: ROOT, stdio: 'pipe' });

    console.log('PR created successfully.');
  } catch {
    console.log('\nCould not create PR (gh CLI not available or not in git repo).');
    console.log('Config file saved for manual review:', outputPath);
  }
}

main().catch((err) => {
  console.error('Auto-onboarding failed:', err);
  process.exit(1);
});
