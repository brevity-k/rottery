/**
 * Auto-close resolved automation-failure GitHub Issues.
 *
 * For each open issue with the `automation-failure` label, checks if the
 * corresponding GitHub Actions workflow has succeeded since the issue was
 * last updated. If so, closes the issue with a resolution comment.
 *
 * Usage: npx tsx scripts/cleanup-stale-issues.ts
 *
 * Requires: GITHUB_TOKEN and GITHUB_REPOSITORY environment variables
 * (auto-provided in GitHub Actions).
 */

import { withRetry } from './lib/retry';
import { RETRY_PRESETS } from './lib/constants';

const LABEL = 'automation-failure';

// Map issue title patterns to workflow filenames
const WORKFLOW_MAP: Record<string, string> = {
  'fetch-lottery-data failed': 'fetch-lottery-data.yml',
  'generate-blog failed': 'generate-blog.yml',
  'Stale lottery data detected': 'fetch-lottery-data.yml',
  'check-new-datasets failed': 'weekly-maintenance.yml',
  'quarterly-tax-update failed': 'weekly-maintenance.yml',
  'quarterly-state-refresh failed': 'weekly-maintenance.yml',
  'SEO health check failed': 'weekly-maintenance.yml',
  'npm security vulnerabilities': 'weekly-maintenance.yml',
};

interface GitHubIssue {
  number: number;
  title: string;
  updated_at: string;
}

interface WorkflowRun {
  conclusion: string | null;
  created_at: string;
}

async function ghApi(path: string, options?: RequestInit): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) throw new Error('GITHUB_TOKEN or GITHUB_REPOSITORY not set');

  const method = options?.method || 'GET';
  const doFetch = () => fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      ...options?.headers,
    },
  }).then(r => { if (!r.ok) throw new Error(`GitHub API ${r.status}: ${method} ${path}`); return r; });

  // Only retry idempotent (GET/PATCH) operations; POST can cause duplicates
  if (method === 'GET' || method === 'PATCH') {
    return withRetry(doFetch, { ...RETRY_PRESETS.GITHUB_API, label: `GitHub API ${method} ${path}` });
  }
  return doFetch();
}

function matchWorkflow(title: string): string | undefined {
  for (const [pattern, workflow] of Object.entries(WORKFLOW_MAP)) {
    if (title.includes(pattern)) return workflow;
  }
  return undefined;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;

  if (!token || !repo) {
    console.log('Not running in GitHub Actions (GITHUB_TOKEN/GITHUB_REPOSITORY not set) — skipping.');
    return;
  }

  console.log('Checking for stale automation-failure issues to auto-close...');

  // Fetch open issues with automation-failure label
  const issuesRes = await ghApi(`/issues?labels=${LABEL}&state=open&per_page=50`);
  const issues: GitHubIssue[] = await issuesRes.json();
  if (issues.length === 0) {
    console.log('No open automation-failure issues found.');
    return;
  }

  console.log(`Found ${issues.length} open automation-failure issue(s).`);

  for (const issue of issues) {
    const workflowFile = matchWorkflow(issue.title);
    if (!workflowFile) {
      console.log(`  #${issue.number}: "${issue.title}" — no matching workflow, skipping.`);
      continue;
    }

    // Get latest workflow run
    let runsData;
    try {
      const runsRes = await ghApi(
        `/actions/workflows/${workflowFile}/runs?per_page=1&status=completed`
      );
      runsData = await runsRes.json();
    } catch {
      console.log(`  #${issue.number}: Could not fetch workflow runs for ${workflowFile}`);
      continue;
    }
    const runs: WorkflowRun[] = runsData.workflow_runs || [];

    if (runs.length === 0) {
      console.log(`  #${issue.number}: No completed runs for ${workflowFile}`);
      continue;
    }

    const latestRun = runs[0];
    const runDate = new Date(latestRun.created_at);
    const issueDate = new Date(issue.updated_at);

    if (latestRun.conclusion === 'success' && runDate > issueDate) {
      console.log(`  #${issue.number}: "${issue.title}" — workflow succeeded on ${latestRun.created_at}, closing.`);

      // Add comment
      await ghApi(`/issues/${issue.number}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          body: `Resolved automatically — the \`${workflowFile}\` workflow succeeded on ${latestRun.created_at}.`,
        }),
      });

      // Close issue
      await ghApi(`/issues/${issue.number}`, {
        method: 'PATCH',
        body: JSON.stringify({ state: 'closed' }),
      });
    } else {
      console.log(`  #${issue.number}: "${issue.title}" — latest run: ${latestRun.conclusion} (${latestRun.created_at}), keeping open.`);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('cleanup-stale-issues failed:', err);
  process.exit(1);
});
