import { Metadata } from 'next';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_URL, SITE_NAME, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: `Our Methodology | ${SITE_NAME}`,
  description: 'Learn how My Lotto Stats calculates frequency analysis, hot & cold numbers, overdue detection, pair analysis, and statistical recommendations.',
  alternates: { canonical: `${SITE_URL}/methodology` },
};

export default function MethodologyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Methodology', url: `${SITE_URL}/methodology` },
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
          <div className="prose prose-gray max-w-none">
            <p>MyLottoStats.com analyzes historical lottery draw data to identify patterns and trends. <strong>It is important to understand that lottery drawings are random events, and no analysis can predict future outcomes.</strong> Our tools are provided for informational and entertainment purposes only. Past performance does not guarantee or influence future results.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequency Analysis</h2>
            <p>Frequency analysis counts how many times each number has appeared across all historical draws in our database. This method answers the question: <em>&quot;Which numbers appear most often?&quot;</em></p>
            <p><strong>How it works:</strong></p>
            <ul>
              <li>We count the total occurrences of each number from all draws</li>
              <li>We calculate the percentage: (number of times drawn &divide; total draws) &times; 100</li>
              <li>We track when each number was last drawn</li>
              <li>Results are sorted from most frequent to least frequent</li>
            </ul>
            <p><strong>Why it&apos;s interesting:</strong> While lottery drawings are random, seeing which numbers have historically appeared most or least frequently can satisfy curiosity about draw patterns. Some players believe frequently appearing numbers will continue to appear, though statistically each draw is independent.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Hot &amp; Cold Numbers</h2>
            <p>This method identifies numbers trending upward (hot) versus numbers rarely appearing recently (cold). Unlike simple frequency analysis, it <em>weights recent draws more heavily</em> than older ones.</p>
            <p><strong>How it works:</strong></p>
            <ul>
              <li><strong>Recent performance (last 20 draws):</strong> weighted 3&times; their actual count</li>
              <li><strong>Medium-term performance (last 100 draws):</strong> weighted 2&times; their count</li>
              <li><strong>All-time performance:</strong> weighted 1&times; their count</li>
              <li>Numbers are scored using: (recent &times; 3) + (medium &times; 2) + (all-time &times; 1)</li>
              <li>Numbers are ranked and divided into thirds: <strong>hot</strong> (top third), <strong>warm</strong> (middle third), and <strong>cold</strong> (bottom third)</li>
            </ul>
            <p><strong>Why it&apos;s interesting:</strong> This approach captures the idea that current lottery activity may differ from historical averages. Some players prefer numbers showing recent momentum, even though future draws remain completely random.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Overdue Analysis</h2>
            <p>Overdue analysis measures how long it has been since each number was last drawn, compared to how frequently we&apos;d <em>expect</em> it to be drawn based on history.</p>
            <p><strong>How it works:</strong></p>
            <ul>
              <li>For each number, we count: <strong>draws since last appearance</strong></li>
              <li>We calculate the <strong>expected interval:</strong> total draws &divide; number of times it appeared</li>
              <li>We compute the <strong>overdue ratio:</strong> (draws since last &divide; expected interval)</li>
              <li>An overdue ratio of 1.0 means the number is exactly on schedule; 1.5 means it&apos;s 50% overdue relative to its historical frequency</li>
            </ul>
            <p><strong>Why it&apos;s interesting:</strong> Some players believe numbers that haven&apos;t appeared recently are &quot;due&quot; to come up soon (the gambler&apos;s fallacy). While mathematically unfounded, tracking this metric allows players to explore this theory.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Pair &amp; Triplet Analysis</h2>
            <p>This analysis examines which combinations of numbers appear together most frequently in draw results. It looks for numbers that tend to be drawn alongside each other.</p>
            <p><strong>How it works:</strong></p>
            <ul>
              <li>We examine every draw and identify all pairs of numbers that appeared together</li>
              <li>We count how many times each pair has been drawn</li>
              <li>We calculate the percentage: (pair occurrences &divide; total draws) &times; 100</li>
              <li>The top 20 most frequent pairs are displayed</li>
            </ul>
            <p><strong>Why it&apos;s interesting:</strong> Numbers drawn together might seem correlated, but this is actually a natural result of random sampling. Displaying pair frequencies helps players understand distribution patterns and create their own custom selections based on combinations they prefer.</p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Recommendation Engine</h2>
            <p>Our recommendation system generates customized number sets based on multiple analysis methods combined. It scores numbers using a weighted strategy approach.</p>
            <p><strong>How it works:</strong></p>
            <ul>
              <li><strong>Frequency component:</strong> Numbers appearing most often historically receive higher scores</li>
              <li><strong>Hot component:</strong> Recently trending numbers receive higher scores</li>
              <li><strong>Overdue component:</strong> Numbers with high overdue ratios receive higher scores</li>
              <li><strong>Pair bonus:</strong> Numbers appearing frequently in top pairs receive slight score boosts</li>
              <li>Each component&apos;s importance is controlled by the selected strategy</li>
              <li>The engine generates multiple unique sets to provide variety</li>
              <li>Each recommendation includes a confidence score (0&ndash;100) based on the average score of selected numbers</li>
            </ul>
            <p><strong>Available Strategies:</strong></p>
            <ul>
              <li><strong>Balanced:</strong> 30% frequency + 30% hot/cold + 25% overdue + 15% pair bonus — a diversified approach</li>
              <li><strong>Trending:</strong> 20% frequency + 50% hot/cold + 15% overdue + 15% pair bonus — favors recent momentum</li>
              <li><strong>Contrarian:</strong> 15% frequency + 10% hot/cold + 60% overdue + 15% pair bonus — targets statistically overdue numbers</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Data Sources &amp; Integrity</h2>
            <p>All lottery data comes from the <strong>NY Open Data SODA API</strong> (data.ny.gov), a government-operated data platform. We fetch data daily and apply automated validation:</p>
            <ul>
              <li>Number range checks against each game&apos;s known format</li>
              <li>Draw date schedule validation</li>
              <li>Duplicate draw detection</li>
              <li>Record count guards (data can never shrink between updates)</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Important Disclaimers</h2>
            <p><strong>Randomness and Independence:</strong> Every lottery drawing is a random, independent event. Previous results do not influence future drawings. The probability of each number being drawn remains constant regardless of past performance.</p>
            <p><strong>Gambler&apos;s Fallacy:</strong> The belief that a number is &quot;due&quot; or that past patterns predict future results is a common misconception. No analysis method changes the mathematical reality that each draw is random.</p>
            <p><strong>Entertainment Only:</strong> MyLottoStats.com provides these analysis tools for educational and entertainment purposes. We do not guarantee accuracy, and we strongly advise that lottery play should only occur with money you can afford to lose. Please play responsibly.</p>
            <p><strong>Data Accuracy:</strong> While we strive to maintain accurate historical data, we recommend verifying any important information through official lottery sources.</p>
          </div>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-sm text-amber-800">{DISCLAIMER_TEXT}</p>
        </div>
      </div>
    </>
  );
}
