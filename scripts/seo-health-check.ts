/**
 * SEO health check script.
 * Runs after build to verify page count, blog validity, and route consistency.
 *
 * Usage: npx tsx scripts/seo-health-check.ts
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — critical issues found
 */

import fs from 'fs';
import path from 'path';
import { MIN_PAGES, LOTTERY_DATA_FILES, DATA_STALENESS_DAYS } from './lib/constants';

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, '.next', 'server', 'app');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const DATA_DIR = path.join(ROOT, 'src', 'data');

let warnings = 0;
let errors = 0;

function warn(message: string) {
  console.warn(`  WARN: ${message}`);
  warnings++;
}

function fail(message: string) {
  console.error(`  FAIL: ${message}`);
  errors++;
}

function pass(message: string) {
  console.log(`  OK: ${message}`);
}

// ---------------------------------------------------------------------------
// 1. Count generated pages
// ---------------------------------------------------------------------------

console.log('\n=== Page count check ===');

function countHtmlFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countHtmlFiles(fullPath);
    } else if (entry.name.endsWith('.html')) {
      count++;
    }
  }
  return count;
}

if (fs.existsSync(BUILD_DIR)) {
  const pageCount = countHtmlFiles(BUILD_DIR);
  if (pageCount < MIN_PAGES) {
    fail(`Only ${pageCount} pages generated (minimum: ${MIN_PAGES})`);
  } else {
    pass(`${pageCount} pages generated`);
  }
} else {
  fail('Build output directory not found — run `npm run build` first');
}

// ---------------------------------------------------------------------------
// 2. Validate blog posts
// ---------------------------------------------------------------------------

console.log('\n=== Blog post validation ===');

if (fs.existsSync(BLOG_DIR)) {
  const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json'));
  let validPosts = 0;

  for (const file of blogFiles) {
    try {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const post = JSON.parse(raw);

      const required = ['slug', 'title', 'content', 'date', 'category'];
      const missing = required.filter(field => !post[field]);

      if (missing.length > 0) {
        warn(`${file}: missing fields: ${missing.join(', ')}`);
      } else {
        validPosts++;
      }

      // Check content length
      if (post.content && post.content.length < 500) {
        warn(`${file}: content is very short (${post.content.length} chars)`);
      }

      // Check slug matches filename
      const expectedSlug = file.replace('.json', '');
      if (post.slug !== expectedSlug) {
        warn(`${file}: slug "${post.slug}" does not match filename`);
      }
    } catch (e) {
      fail(`${file}: invalid JSON — ${e}`);
    }
  }

  pass(`${validPosts}/${blogFiles.length} blog posts valid`);
} else {
  warn('No blog directory found');
}

// ---------------------------------------------------------------------------
// 3. Validate data file freshness
// ---------------------------------------------------------------------------

console.log('\n=== Data freshness check ===');

for (const file of LOTTERY_DATA_FILES) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    fail(`${file}: data file missing`);
    continue;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!data.lastUpdated) {
      warn(`${file}: no lastUpdated field`);
    } else {
      const updated = new Date(data.lastUpdated);
      const age = Date.now() - updated.getTime();
      const days = Math.floor(age / (1000 * 60 * 60 * 24));
      if (days > DATA_STALENESS_DAYS) {
        warn(`${file}: data is ${days} days old`);
      } else {
        pass(`${file}: updated ${days} day(s) ago`);
      }
    }
  } catch {
    fail(`${file}: could not parse`);
  }
}

// ---------------------------------------------------------------------------
// 4. Check for stale warning marker
// ---------------------------------------------------------------------------

console.log('\n=== Stale data check ===');

const staleWarningPath = path.join(DATA_DIR, '.stale-warning');
if (fs.existsSync(staleWarningPath)) {
  warn('Stale data warning marker found');
} else {
  pass('No stale data warnings');
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

console.log(`\n=== Summary ===`);
console.log(`  Errors: ${errors}`);
console.log(`  Warnings: ${warnings}`);

if (errors > 0) {
  console.error('\nSEO health check FAILED — critical issues found.');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\nSEO health check PASSED with warnings.');
} else {
  console.log('\nSEO health check PASSED.');
}
