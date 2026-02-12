/**
 * Post-build validation script.
 * Verifies that the build produced the expected number of pages and that
 * all data files are valid.
 *
 * Usage: npx tsx scripts/validate-build.ts
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed (blocks commit in CI)
 */

import fs from 'fs';
import path from 'path';
import { MIN_DRAWS, MIN_PAGES } from './lib/constants';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'src', 'data');
const BLOG_DIR = path.join(ROOT, 'content', 'blog');
const BUILD_DIR = path.join(ROOT, '.next', 'server', 'app');

let failed = false;

function fail(message: string) {
  console.error(`  FAIL: ${message}`);
  failed = true;
}

function pass(message: string) {
  console.log(`  OK: ${message}`);
}

// ---------------------------------------------------------------------------
// 1. Validate lottery JSON data files
// ---------------------------------------------------------------------------

console.log('\n=== Validating lottery data files ===');

for (const [filename, minCount] of Object.entries(MIN_DRAWS)) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fail(`${filename} does not exist`);
    continue;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.draws || !Array.isArray(data.draws)) {
      fail(`${filename} missing "draws" array`);
      continue;
    }
    if (data.draws.length < minCount) {
      fail(`${filename} has ${data.draws.length} draws (minimum: ${minCount})`);
    } else {
      pass(`${filename}: ${data.draws.length} draws`);
    }
  } catch (e) {
    fail(`${filename} is not valid JSON: ${e}`);
  }
}

// ---------------------------------------------------------------------------
// 2. Validate blog JSON files
// ---------------------------------------------------------------------------

console.log('\n=== Validating blog posts ===');

if (fs.existsSync(BLOG_DIR)) {
  const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json'));
  let blogErrors = 0;

  for (const file of blogFiles) {
    try {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const post = JSON.parse(raw);
      const required = ['slug', 'title', 'content', 'date'];
      for (const field of required) {
        if (!post[field]) {
          fail(`${file} missing required field "${field}"`);
          blogErrors++;
        }
      }
    } catch (e) {
      fail(`${file} is not valid JSON: ${e}`);
      blogErrors++;
    }
  }

  if (blogErrors === 0) {
    pass(`${blogFiles.length} blog posts validated`);
  }
} else {
  pass('No blog directory yet (OK for first build)');
}

// ---------------------------------------------------------------------------
// 3. Count generated routes from .next/server/app
// ---------------------------------------------------------------------------

console.log('\n=== Validating build output ===');

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
    fail(`Build produced only ${pageCount} pages (minimum: ${MIN_PAGES})`);
  } else {
    pass(`Build produced ${pageCount} pages`);
  }
} else {
  fail(`Build output directory not found: ${BUILD_DIR}`);
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

console.log('');
if (failed) {
  console.error('Build validation FAILED — blocking commit.');
  process.exit(1);
} else {
  console.log('Build validation PASSED.');
}
