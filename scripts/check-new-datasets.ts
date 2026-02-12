/**
 * Auto-detect new SODA lottery datasets on data.ny.gov
 *
 * Run: npx tsx scripts/check-new-datasets.ts
 *
 * Queries the SODA API catalog for lottery-related datasets and compares
 * against known dataset IDs. If new datasets are found, creates a GitHub
 * Issue (when running in CI with GITHUB_TOKEN) or logs to console.
 */

import { withRetry } from './lib/retry';
import { DATASET_ID_TO_GAME, RETRY_PRESETS } from './lib/constants';

const LOTTERY_SEARCH_TERMS = [
  'lottery', 'lotto', 'winning numbers', 'draw', 'jackpot',
  'mega', 'powerball', 'millionaire', 'pick', 'cash', 'numbers game', 'take five',
];

interface SodaCatalogEntry {
  resource: {
    id: string;
    name: string;
    description?: string;
    updatedAt?: string;
  };
  metadata?: {
    domain?: string;
  };
}

async function searchSodaCatalog(): Promise<SodaCatalogEntry[]> {
  const results: SodaCatalogEntry[] = [];

  for (const term of LOTTERY_SEARCH_TERMS) {
    try {
      const url = `https://api.us.socrata.com/api/catalog/v1?domains=data.ny.gov&search_context=data.ny.gov&q=${encodeURIComponent(term)}&limit=50`;
      const response = await withRetry(
        () => fetch(url).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r;
        }),
        { ...RETRY_PRESETS.SODA_CATALOG, label: `SODA catalog search "${term}"` }
      );

      const data = await response.json();
      if (data.results) {
        results.push(...data.results);
      }
    } catch {
      // Skip on error — non-critical search term
    }
  }

  // Deduplicate by resource ID
  const seen = new Set<string>();
  return results.filter(r => {
    if (!r.resource?.id || seen.has(r.resource.id)) return false;
    seen.add(r.resource.id);
    return true;
  });
}

async function createGitHubIssue(title: string, body: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;

  if (!token || !repo) {
    console.log('GITHUB_TOKEN or GITHUB_REPOSITORY not set. Logging instead of creating issue.');
    console.log(`\n--- ISSUE ---\nTitle: ${title}\nBody:\n${body}\n`);
    return;
  }

  // Check for existing open issue with new-dataset label to prevent duplicates
  try {
    const searchResponse = await withRetry(
      () => fetch(
        `https://api.github.com/repos/${repo}/issues?state=open&labels=new-dataset&per_page=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r; }),
      { ...RETRY_PRESETS.GITHUB_API, label: 'GitHub issue search' }
    );
    const openIssues = await searchResponse.json();
    if (Array.isArray(openIssues) && openIssues.length > 0) {
      // Comment on existing issue instead of creating a new one
      const existingIssue = openIssues[0];
      const commentResponse = await withRetry(
        () => fetch(
          `https://api.github.com/repos/${repo}/issues/${existingIssue.number}/comments`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ body: `## Updated Scan Results\n\n${body}` }),
          }
        ).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r; }),
        { ...RETRY_PRESETS.GITHUB_API, label: 'GitHub issue comment' }
      );
      if (commentResponse.ok) {
        console.log(`Updated existing issue #${existingIssue.number} with new scan results`);
        return;
      }
    }
  } catch {
    // Fall through to create new issue
  }

  const response = await withRetry(
    () => fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['automation', 'new-dataset'],
      }),
    }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r; }),
    { ...RETRY_PRESETS.GITHUB_API, label: 'GitHub issue create' }
  );

  const issue = await response.json();
  console.log(`Created GitHub Issue #${issue.number}: ${title}`);
}

async function main() {
  console.log('Checking for new SODA lottery datasets...');

  const catalogEntries = await searchSodaCatalog();
  console.log(`Found ${catalogEntries.length} lottery-related datasets on data.ny.gov`);

  const newDatasets = catalogEntries.filter(entry => {
    const id = entry.resource.id;
    return !DATASET_ID_TO_GAME[id];
  });

  // Filter to only datasets that look like they contain winning numbers
  const relevantNew = newDatasets.filter(entry => {
    const name = (entry.resource.name || '').toLowerCase();
    const desc = (entry.resource.description || '').toLowerCase();
    const combined = `${name} ${desc}`;
    return (
      combined.includes('winning') ||
      combined.includes('lottery') ||
      combined.includes('lotto') ||
      combined.includes('draw') ||
      combined.includes('numbers')
    );
  });

  if (relevantNew.length === 0) {
    console.log('No new lottery datasets found.');
    return;
  }

  console.log(`\nFound ${relevantNew.length} potentially new lottery datasets:`);
  for (const entry of relevantNew) {
    console.log(`  - ${entry.resource.name} (ID: ${entry.resource.id})`);
  }

  const issueBody = `## New Lottery Datasets Detected

The automated dataset scanner found ${relevantNew.length} new lottery-related dataset(s) on data.ny.gov that are not currently tracked:

${relevantNew.map(e => `### ${e.resource.name}
- **Dataset ID:** \`${e.resource.id}\`
- **Description:** ${e.resource.description || 'N/A'}
- **API URL:** \`https://data.ny.gov/resource/${e.resource.id}.json\`
- **Last Updated:** ${e.resource.updatedAt || 'Unknown'}
`).join('\n')}

### Action Needed
1. Check if any of these are new lottery games (e.g., Millionaire for Life)
2. If relevant, add to \`scripts/update-data.ts\` sources and \`src/lib/lotteries/config.ts\`
3. Update CLAUDE.md known dataset IDs

*This issue was auto-generated by \`scripts/check-new-datasets.ts\`*`;

  await createGitHubIssue(
    `[Auto] ${relevantNew.length} new lottery dataset(s) detected`,
    issueBody
  );

  // Optionally trigger auto-onboarding for the first new dataset
  if (process.env.ANTHROPIC_API_KEY && relevantNew.length > 0) {
    const firstNew = relevantNew[0];
    console.log(`\nAttempting auto-onboarding for: ${firstNew.resource.name} (${firstNew.resource.id})`);
    try {
      const { execSync } = await import('child_process');
      execSync(`npx tsx scripts/onboard-new-game.ts ${firstNew.resource.id}`, {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: { ...process.env },
      });
    } catch (e) {
      console.log('Auto-onboarding failed (non-fatal):', e);
    }
  }
}

main().catch((err) => {
  console.error('check-new-datasets failed:', err);
  process.exit(1);
});
