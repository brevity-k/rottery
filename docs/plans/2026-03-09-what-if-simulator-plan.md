# What-If Simulator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a "What If You Never Missed a Draw?" simulator — the single sharp feature that hooks visitors, drives shares, and funnels into existing content.

**Architecture:** Server page loads all draw data at build time (SSG), passes to `'use client'` component. Uses existing `analyzeWhatIf()` engine and prize tables. Three-phase UX: input → animated reveal → shareable results. New route at `/simulator`.

**Tech Stack:** Next.js 16 (App Router, SSG), TypeScript, Tailwind CSS v4, Recharts 3 (timeline chart)

---

## Existing Infrastructure (DO NOT modify these)

- `src/lib/analysis/whatIf.ts` — `analyzeWhatIf(userNumbers, userBonus, draws, game, startDate?)` → `WhatIfResult`
- `src/lib/lotteries/prizes.ts` — `prizeTables` with tiers for all 6 games
- `src/lib/lotteries/types.ts` — `DrawResult`, `WhatIfResult`, `PrizeTierResult`, `LotterySlug`, `LotteryConfig`
- `src/lib/lotteries/config.ts` — `getAllLotteries()`, `getLottery(slug)`
- `src/lib/data/fetcher.ts` — `loadLotteryData(slug)` → reads JSON from `src/data/`
- `src/components/lottery/LotteryBall.tsx` — `<LotteryBall number type size />`
- `src/components/tools/TicketChecker.tsx` — Reference pattern for game selector + number inputs

---

### Task 1: Server Page — Load Data and Route Setup

**Files:**
- Create: `src/app/simulator/page.tsx`

**Step 1: Create the server page**

This follows the exact pattern from `src/app/tools/ticket-checker/page.tsx` but loads ALL draws (not just 1 year) since the simulator needs full history.

```tsx
import { Metadata } from 'next';
import { getAllLotteries } from '@/lib/lotteries/config';
import { loadLotteryData } from '@/lib/data/fetcher';
import { breadcrumbSchema } from '@/lib/seo/structuredData';
import { SITE_NAME, SITE_URL, DISCLAIMER_TEXT } from '@/lib/utils/constants';
import { DrawResult } from '@/lib/lotteries/types';
import WhatIfSimulator from '@/components/simulator/WhatIfSimulator';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: `What If You Never Missed a Draw? | ${SITE_NAME}`,
  description: 'Enter your lucky numbers and see what would have happened if you played every single draw. Discover your near-misses, total winnings, and biggest "what if" moments.',
  openGraph: {
    title: 'What If You Never Missed a Draw?',
    description: 'Enter your lucky numbers and see what would have happened if you played every draw.',
    url: `${SITE_URL}/simulator`,
  },
  alternates: {
    canonical: `${SITE_URL}/simulator`,
  },
};

interface SimulatorLotteryConfig {
  slug: string;
  name: string;
  mainNumbers: { count: number; max: number };
  bonusNumber: { count: number; max: number; label: string };
  ticketPrice: number;
  colors: { primary: string; ball: string; bonusBall: string };
}

export default function SimulatorPage() {
  const lotteries = getAllLotteries();
  const drawsByGame: Record<string, DrawResult[]> = {};

  const lotteryConfigs: SimulatorLotteryConfig[] = lotteries
    .filter(l => !l.retiredDate) // Only active games
    .map(lottery => {
      try {
        const data = loadLotteryData(lottery.slug);
        drawsByGame[lottery.slug] = data.draws;
      } catch {
        drawsByGame[lottery.slug] = [];
      }
      return {
        slug: lottery.slug,
        name: lottery.name,
        mainNumbers: lottery.mainNumbers,
        bonusNumber: lottery.bonusNumber,
        ticketPrice: lottery.ticketPrice,
        colors: {
          primary: lottery.colors.primary,
          ball: lottery.colors.ball,
          bonusBall: lottery.colors.bonusBall,
        },
      };
    });

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'What If Simulator', url: `${SITE_URL}/simulator` },
      ])} />

      <WhatIfSimulator lotteries={lotteryConfigs} drawsByGame={drawsByGame} />
    </>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. Page at `/simulator` renders (empty component for now).

**Step 3: Commit**

```bash
git add src/app/simulator/page.tsx
git commit -m "feat(simulator): add server page with data loading

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Number Input UI — Game Selector and Tappable Number Grid

**Files:**
- Create: `src/components/simulator/WhatIfSimulator.tsx`

This is the MAIN component. Build it incrementally — this task covers only the INPUT phase (no results yet).

**Step 1: Create the client component with input UI**

```tsx
'use client';

import { useState, useMemo, useCallback } from 'react';
import { DrawResult, LotterySlug, WhatIfResult } from '@/lib/lotteries/types';
import { analyzeWhatIf } from '@/lib/analysis/whatIf';

interface SimulatorLotteryConfig {
  slug: string;
  name: string;
  mainNumbers: { count: number; max: number };
  bonusNumber: { count: number; max: number; label: string };
  ticketPrice: number;
  colors: { primary: string; ball: string; bonusBall: string };
}

interface WhatIfSimulatorProps {
  lotteries: SimulatorLotteryConfig[];
  drawsByGame: Record<string, DrawResult[]>;
}

export default function WhatIfSimulator({ lotteries, drawsByGame }: WhatIfSimulatorProps) {
  const [selectedGame, setSelectedGame] = useState(lotteries[0]?.slug || '');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedBonus, setSelectedBonus] = useState<number | null>(null);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const lottery = lotteries.find(l => l.slug === selectedGame)!;
  const hasBonus = lottery.bonusNumber.count > 0;
  const draws = drawsByGame[selectedGame] || [];

  const handleGameChange = (slug: string) => {
    setSelectedGame(slug);
    setSelectedNumbers([]);
    setSelectedBonus(null);
    setResult(null);
  };

  const toggleNumber = (num: number) => {
    setResult(null);
    setSelectedNumbers(prev => {
      if (prev.includes(num)) return prev.filter(n => n !== num);
      if (prev.length >= lottery.mainNumbers.count) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
  };

  const toggleBonus = (num: number) => {
    setResult(null);
    setSelectedBonus(prev => prev === num ? null : num);
  };

  const isReady = selectedNumbers.length === lottery.mainNumbers.count
    && (!hasBonus || selectedBonus !== null);

  const handleAnalyze = useCallback(() => {
    if (!isReady) return;
    setIsAnalyzing(true);

    // Small delay for animation feel
    setTimeout(() => {
      const whatIf = analyzeWhatIf(
        selectedNumbers,
        selectedBonus ?? undefined,
        draws,
        selectedGame as LotterySlug
      );
      setResult(whatIf);
      setIsAnalyzing(false);
    }, 800);
  }, [selectedNumbers, selectedBonus, draws, selectedGame, isReady]);

  // --- INPUT PHASE ---
  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            What If You Never Missed a Draw?
          </h1>
          <p className="text-gray-500 mb-8">
            Pick your numbers. We&apos;ll replay every draw in history.
          </p>

          {/* Game Selector — pill buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {lotteries.map(l => (
              <button
                key={l.slug}
                onClick={() => handleGameChange(l.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGame === l.slug
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>

          {/* Number counter */}
          <p className="text-sm text-gray-400 mb-3">
            Pick {lottery.mainNumbers.count} numbers from 1–{lottery.mainNumbers.max}
            {' '}
            <span className="font-medium text-gray-600">
              ({selectedNumbers.length}/{lottery.mainNumbers.count})
            </span>
          </p>

          {/* Main number grid — tappable circles */}
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2 mb-6">
            {Array.from({ length: lottery.mainNumbers.max }, (_, i) => i + 1).map(num => {
              const isSelected = selectedNumbers.includes(num);
              const isFull = selectedNumbers.length >= lottery.mainNumbers.count;
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={!isSelected && isFull}
                  className={`aspect-square rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white scale-110 shadow-lg'
                      : isFull
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Bonus number grid */}
          {hasBonus && (
            <>
              <p className="text-sm text-gray-400 mb-3">
                Pick your {lottery.bonusNumber.label} (1–{lottery.bonusNumber.max})
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8">
                {Array.from({ length: lottery.bonusNumber.max }, (_, i) => i + 1).map(num => {
                  const isSelected = selectedBonus === num;
                  return (
                    <button
                      key={num}
                      onClick={() => toggleBonus(num)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-red-500 text-white scale-110 shadow-lg'
                          : 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Selected numbers display */}
          {selectedNumbers.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {selectedNumbers.map(n => (
                <span key={n} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {n}
                </span>
              ))}
              {hasBonus && selectedBonus && (
                <>
                  <span className="text-gray-300 font-bold">+</span>
                  <span className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                    {selectedBonus}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Run button */}
          <button
            onClick={handleAnalyze}
            disabled={!isReady || isAnalyzing}
            className={`w-full max-w-xs py-3.5 px-8 rounded-full font-semibold text-lg transition-all ${
              isReady
                ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Replaying {draws.length.toLocaleString()} draws...
              </span>
            ) : (
              'Run My Numbers'
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS PHASE (Task 3) ---
  return <div>Results placeholder</div>;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. `/simulator` shows game selector + number grid + run button.

**Step 3: Test manually**

Run: `npm run dev`
Visit: `http://localhost:3000/simulator`
Expected: Can select game, tap numbers, see them highlighted, button enables when all picked.

**Step 4: Commit**

```bash
git add src/components/simulator/WhatIfSimulator.tsx
git commit -m "feat(simulator): add number input UI with tappable grid

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Results Reveal — The Emotional Payoff

**Files:**
- Modify: `src/components/simulator/WhatIfSimulator.tsx`

Replace the `return <div>Results placeholder</div>` at the bottom with the full results UI. This is the most important task — the "gut punch" moment.

**Step 1: Add helper functions at the top of the component**

```tsx
// Add these helpers inside the component, before the return statements:

const totalSpent = result.totalDrawsChecked * lottery.ticketPrice;
const netResult = result.totalWinnings - totalSpent;

// Find the "near miss" — highest match count that DIDN'T win the jackpot
const nearMisses = result.matchTimeline
  .filter(m => m.matched >= (lottery.mainNumbers.count - 1))
  .sort((a, b) => b.matched - a.matched || (b.bonusMatch ? 1 : 0) - (a.bonusMatch ? 1 : 0));
const biggestNearMiss = nearMisses[0] || null;

// Find the closest to jackpot — the draw where they matched the most numbers
const closestToJackpot = result.matchTimeline
  .reduce((best, entry) => {
    const score = entry.matched * 10 + (entry.bonusMatch ? 1 : 0);
    const bestScore = best ? best.matched * 10 + (best.bonusMatch ? 1 : 0) : 0;
    return score > bestScore ? entry : best;
  }, null as typeof result.matchTimeline[0] | null);
```

**Step 2: Build the results reveal UI**

Replace the results placeholder with a staged reveal. The UX is:
1. "You would have spent..." (stark number)
2. "You would have won..." (honest number)
3. "But on [date]..." (the emotional near-miss moment)
4. Full breakdown (tier results + timeline)

```tsx
// --- RESULTS PHASE ---
return (
  <div className="min-h-screen px-4 py-12">
    <div className="max-w-2xl mx-auto">

      {/* Back / Reset button */}
      <button
        onClick={() => setResult(null)}
        className="mb-8 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        ← Pick different numbers
      </button>

      {/* Your numbers */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {selectedNumbers.map(n => (
          <span key={n} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {n}
          </span>
        ))}
        {hasBonus && selectedBonus && (
          <>
            <span className="text-gray-300 font-bold">+</span>
            <span className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
              {selectedBonus}
            </span>
          </>
        )}
      </div>

      {/* Section 1: The spend */}
      <div className="text-center mb-12">
        <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">
          If you played every {lottery.name} draw
        </p>
        <p className="text-5xl md:text-6xl font-bold text-gray-900">
          ${totalSpent.toLocaleString()}
        </p>
        <p className="text-gray-400 mt-1">
          spent on {result.totalDrawsChecked.toLocaleString()} tickets at ${lottery.ticketPrice} each
        </p>
      </div>

      {/* Section 2: The winnings */}
      <div className="text-center mb-12">
        <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">
          You would have won
        </p>
        <p className={`text-5xl md:text-6xl font-bold ${result.totalWinnings > 0 ? 'text-green-600' : 'text-gray-300'}`}>
          ${result.totalWinnings.toLocaleString()}
        </p>
        <p className={`mt-1 ${netResult >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {netResult >= 0 ? `Net gain: +$${netResult.toLocaleString()}` : `Net loss: -$${Math.abs(netResult).toLocaleString()}`}
        </p>
      </div>

      {/* Section 3: The near-miss moment */}
      {closestToJackpot && closestToJackpot.matched >= 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center mb-12">
          <p className="text-sm text-amber-600 uppercase tracking-wide mb-2">
            Your closest call
          </p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {closestToJackpot.matched === lottery.mainNumbers.count - 1
              ? 'ONE number away'
              : closestToJackpot.matched === lottery.mainNumbers.count
                ? closestToJackpot.bonusMatch
                  ? 'JACKPOT MATCH!'
                  : `All ${lottery.mainNumbers.count} numbers — just missed the ${lottery.bonusNumber.label}!`
                : `${closestToJackpot.matched} out of ${lottery.mainNumbers.count} numbers`
            }
          </p>
          <p className="text-gray-500">
            on {new Date(closestToJackpot.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          {closestToJackpot.prize > 0 && (
            <p className="text-lg font-semibold text-green-600 mt-2">
              Won ${closestToJackpot.prize.toLocaleString()} from that draw
            </p>
          )}
        </div>
      )}

      {/* Section 4: Prize tier breakdown */}
      {result.tiers.some(t => t.count > 0) && (
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Prize Breakdown</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Match</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Prize</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Times</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {result.tiers.filter(t => t.count > 0).map(tier => (
                  <tr key={tier.label} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium text-gray-900">{tier.label}</td>
                    <td className="py-3 px-4 text-right text-gray-600">${Number(tier.prize).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{tier.count}×</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">${tier.totalWon.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 5: Recent match timeline (last 20) */}
      {result.matchTimeline.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Match History
            <span className="text-sm font-normal text-gray-400 ml-2">
              {result.matchTimeline.length} winning draw{result.matchTimeline.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...result.matchTimeline].reverse().slice(0, 50).map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-4 rounded-lg bg-gray-50">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {entry.matched} match{entry.matched !== 1 ? 'es' : ''}
                    {entry.bonusMatch ? ` + ${lottery.bonusNumber.label}` : ''}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
                {entry.prize > 0 && (
                  <span className="text-sm font-semibold text-green-600">
                    +${entry.prize.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No matches at all */}
      {result.matchTimeline.length === 0 && (
        <div className="text-center py-12 mb-12">
          <p className="text-xl text-gray-400">No matches across {result.totalDrawsChecked.toLocaleString()} draws.</p>
          <p className="text-sm text-gray-300 mt-1">Your numbers are truly unique.</p>
        </div>
      )}

      {/* CTA: Try different numbers or explore */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <button
          onClick={() => setResult(null)}
          className="px-6 py-3 rounded-full font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Try Different Numbers
        </button>
        <a
          href={`/${lottery.slug}/statistics`}
          className="px-6 py-3 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-center"
        >
          See {lottery.name} Statistics →
        </a>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-300 text-center max-w-md mx-auto">
        For entertainment purposes only. Lottery draws are random — past results do not predict future outcomes. Prize amounts shown are base prizes; actual jackpots vary by draw.
      </p>
    </div>
  </div>
);
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Test full flow manually**

Run: `npm run dev`
Visit: `http://localhost:3000/simulator`
Test: Select Powerball → pick 5 numbers + 1 bonus → click "Run My Numbers" → see results.

**Step 4: Commit**

```bash
git add src/components/simulator/WhatIfSimulator.tsx
git commit -m "feat(simulator): add results reveal with near-miss moment and prize breakdown

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Add Entry Point from Header Navigation

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/app/sitemap.ts`

**Step 1: Add "What If?" link to header navigation**

Read `src/components/layout/Header.tsx` and add a prominent link to `/simulator`. Place it as a top-level nav item (not in a dropdown) — this is the hero feature. Style it to stand out slightly (e.g., with a subtle highlight or different weight).

```tsx
// Add to the main nav items, before or after the existing links:
<Link
  href="/simulator"
  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
>
  What If?
</Link>
```

**Step 2: Add to sitemap**

In `src/app/sitemap.ts`, add the simulator page to the static pages array:

```ts
{
  url: `${SITE_URL}/simulator`,
  lastModified: new Date(),
  changeFrequency: 'monthly' as const,
  priority: 0.9,
},
```

Priority 0.9 — this is a hero page, same as lottery overview pages.

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds. Sitemap includes `/simulator`.

**Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/app/sitemap.ts
git commit -m "feat(simulator): add nav link and sitemap entry

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Polish — Animations, Loading State, Mobile

**Files:**
- Modify: `src/components/simulator/WhatIfSimulator.tsx`

**Step 1: Add staggered reveal animation to results**

Wrap each result section in an animated container. Use CSS transitions with staggered delays — no external animation library needed:

```tsx
// Add a utility class at the top of the file:
const fadeIn = (delay: number) =>
  `animate-fadeIn opacity-0 [animation-fill-mode:forwards]`
  + ` [animation-delay:${delay}ms]`;

// Then add a <style> tag at the top of the results JSX:
<style>{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out;
  }
`}</style>

// Apply to each section:
<div style={{ animationDelay: '0ms' }} className="animate-fadeIn opacity-0 [animation-fill-mode:forwards]">
  {/* Section 1: The spend */}
</div>
<div style={{ animationDelay: '400ms' }} className="animate-fadeIn opacity-0 [animation-fill-mode:forwards]">
  {/* Section 2: The winnings */}
</div>
<div style={{ animationDelay: '800ms' }} className="animate-fadeIn opacity-0 [animation-fill-mode:forwards]">
  {/* Section 3: The near-miss */}
</div>
<div style={{ animationDelay: '1200ms' }} className="animate-fadeIn opacity-0 [animation-fill-mode:forwards]">
  {/* Section 4+5: Breakdown and timeline */}
</div>
```

**Step 2: Improve loading state**

During analysis (the 800ms setTimeout), show a more engaging loading state:

```tsx
{isAnalyzing && (
  <div className="min-h-screen flex flex-col items-center justify-center px-4">
    <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
    <p className="text-lg font-medium text-gray-900">
      Replaying {draws.length.toLocaleString()} draws...
    </p>
    <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
  </div>
)}
```

**Step 3: Verify mobile layout**

Run: `npm run dev`
Test at 375px width (mobile):
- Number grid should wrap properly (10 columns may need to reduce to 7 or 8 on small screens)
- Bonus grid should wrap
- Results should be readable
- No horizontal scroll

Adjust grid: Use `grid-cols-7 sm:grid-cols-10` if 10 columns is too tight on mobile.

**Step 4: Commit**

```bash
git add src/components/simulator/WhatIfSimulator.tsx
git commit -m "feat(simulator): add reveal animations, loading state, and mobile polish

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Final Build Verification

**Step 1: Full build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 2: Lint**

Run: `npm run lint`
Expected: No lint errors in new files.

**Step 3: Manual test all 5 active games**

Run: `npm run dev`
Test each game at `/simulator`:
- [ ] Powerball: 5 numbers (1-69) + Powerball (1-26)
- [ ] Mega Millions: 5 numbers (1-70) + Mega Ball (1-24)
- [ ] NY Lotto: 6 numbers (1-59) + Bonus (1-59)
- [ ] Take 5: 5 numbers (1-39), no bonus
- [ ] Millionaire for Life: 5 numbers (1-58) + Millionaire Ball (1-5)

For each: verify grid sizes, bonus presence, analysis runs, results display.

**Step 4: Verify Cash4Life excluded**

Cash4Life (retired) should NOT appear in game selector since we filter `!l.retiredDate`.

**Step 5: Commit if any fixes needed**

```bash
git add -u
git commit -m "fix(simulator): address build/lint/test issues

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Verification Checklist

After all tasks:

- [ ] `npm run build` — clean
- [ ] `npm run lint` — clean
- [ ] `/simulator` loads with game selector and number grid
- [ ] Tapping numbers selects/deselects them
- [ ] Button enables only when all required numbers are picked
- [ ] "Run My Numbers" shows loading then results
- [ ] Results show: total spent, total won, net, near-miss, prize breakdown, timeline
- [ ] "Try Different Numbers" resets to input
- [ ] "See {Game} Statistics →" links correctly
- [ ] Header has "What If?" link
- [ ] Sitemap includes `/simulator`
- [ ] Mobile layout works (375px width)
- [ ] Cash4Life is excluded (retired)
- [ ] All 5 active games work end-to-end
