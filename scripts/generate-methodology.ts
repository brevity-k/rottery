/**
 * Generates the methodology page content by reading analysis source code
 * and using Claude to produce user-friendly explanations.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-methodology.ts
 *
 * Output: src/app/methodology/page.tsx
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { withRetry } from './lib/retry';
import { CLAUDE_MODEL } from './lib/constants';

const ROOT = process.cwd();
const OUTPUT_FILE = path.join(ROOT, 'src', 'app', 'methodology', 'page.tsx');

const ANALYSIS_FILES = [
  'src/lib/analysis/frequency.ts',
  'src/lib/analysis/hotCold.ts',
  'src/lib/analysis/overdue.ts',
  'src/lib/analysis/pairs.ts',
  'src/lib/analysis/recommendations.ts',
];

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ANTHROPIC_API_KEY not set — skipping methodology page generation.');
    return;
  }

  // Read analysis source files
  const sources: string[] = [];
  for (const file of ANALYSIS_FILES) {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      sources.push(`=== ${file} ===\n${content}`);
    }
  }

  if (sources.length === 0) {
    console.error('No analysis files found.');
    process.exit(1);
  }

  const prompt = `You are writing a methodology page for MyLottoStats.com, a lottery statistics website.

Based on the source code below, generate user-friendly HTML content explaining how each analysis method works. This page establishes E-E-A-T (expertise) for a YMYL site.

RULES:
- Write clear, accessible explanations that a non-technical lottery player can understand
- Include mathematical formulas where relevant (use simple notation, not LaTeX)
- Organize by analysis type: Frequency Analysis, Hot & Cold Numbers, Overdue Analysis, Pair/Triplet Analysis, Recommendation Engine
- Use HTML tags: h2, h3, p, ul, li, strong, em
- Emphasize that all analysis is informational and entertainment-only — it does not predict future outcomes
- Explain why each method is interesting/useful despite lottery randomness
- Mention specific parameters (e.g., "last 20 draws weighted 3x")
- Total length: 800-1200 words
- Do NOT include any page wrapper, imports, or React component code — just the HTML content string

SOURCE CODE:
${sources.join('\n\n')}

Respond with ONLY the HTML content string (no markdown fences, no explanation). Start with an <h2> tag.`;

  console.log('Generating methodology page content...');

  const client = new Anthropic();
  const message = await withRetry(
    () => client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
    { maxAttempts: 2, baseDelayMs: 3000, label: 'Claude methodology generation' }
  );

  let htmlContent = message.content[0].type === 'text' ? message.content[0].text : '';

  // Strip markdown fences if Claude wrapped the response
  htmlContent = htmlContent.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();

  if (!htmlContent.includes('<h2')) {
    console.error('Generated content does not look like HTML:', htmlContent.slice(0, 200));
    process.exit(1);
  }

  // Escape backticks and ${} in the content for template literal safety
  const escapedContent = htmlContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  const pageComponent = `import { Metadata } from 'next';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_URL, SITE_NAME, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: \`Our Methodology | \${SITE_NAME}\`,
  description: 'Learn how My Lotto Stats calculates frequency analysis, hot & cold numbers, overdue detection, pair analysis, and statistical recommendations.',
  alternates: { canonical: \`\${SITE_URL}/methodology\` },
};

export default function MethodologyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Methodology', url: \`\${SITE_URL}/methodology\` },
      ])} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Methodology' }]} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Our Methodology
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Transparency in how we analyze lottery data — our methods, our math, and our limitations.
        </p>

        <Card className="mb-8">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: \`${escapedContent}\` }}
          />
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </>
  );
}
`;

  // Ensure directory exists
  const dir = path.dirname(OUTPUT_FILE);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, pageComponent);
  console.log(`Generated: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Methodology page generation failed:', err);
  process.exit(1);
});
