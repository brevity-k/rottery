'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { SimulatorLotteryConfig } from '@/app/simulator/page';
import { DrawResult, WhatIfResult, LotterySlug } from '@/lib/lotteries/types';
import { analyzeWhatIf } from '@/lib/analysis/whatIf';

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

  const lottery = lotteries.find(l => l.slug === selectedGame);
  const hasBonus = lottery ? lottery.bonusNumber.count > 0 : false;
  const mainCount = lottery?.mainNumbers.count ?? 5;
  const mainMax = lottery?.mainNumbers.max ?? 69;
  const bonusMax = lottery?.bonusNumber.max ?? 26;
  const draws = drawsByGame[selectedGame] || [];

  const isReady =
    selectedNumbers.length === mainCount &&
    (!hasBonus || selectedBonus !== null);

  const handleGameChange = useCallback((slug: string) => {
    setSelectedGame(slug);
    setSelectedNumbers([]);
    setSelectedBonus(null);
    setResult(null);
  }, []);

  const toggleNumber = useCallback((num: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      }
      if (prev.length >= mainCount) return prev;
      return [...prev, num].sort((a, b) => a - b);
    });
    setResult(null);
  }, [mainCount]);

  const toggleBonus = useCallback((num: number) => {
    setSelectedBonus(prev => (prev === num ? null : num));
    setResult(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!isReady || !lottery) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const whatIfResult = analyzeWhatIf(
        selectedNumbers,
        selectedBonus ?? undefined,
        draws,
        selectedGame as LotterySlug,
      );
      setResult(whatIfResult);
      setIsAnalyzing(false);
    }, 800);
  }, [isReady, lottery, selectedNumbers, selectedBonus, draws, selectedGame]);

  // Derived results data
  const resultsData = useMemo(() => {
    if (!result || !lottery) return null;

    const totalSpent = result.totalDrawsChecked * lottery.ticketPrice;
    const netResult = result.totalWinnings - totalSpent;

    // Find closest-to-jackpot draw
    let closestToJackpot: (typeof result.matchTimeline)[number] | null = null;
    let closestScore = -1;
    for (const entry of result.matchTimeline) {
      const score = entry.matched * 10 + (entry.bonusMatch ? 1 : 0);
      if (score > closestScore) {
        closestScore = score;
        closestToJackpot = entry;
      }
    }

    // Winning draws (most recent first, capped at 50)
    const winningDraws = [...result.matchTimeline].reverse().slice(0, 50);

    // Tiers with count > 0
    const activeTiers = result.tiers.filter(t => t.count > 0);

    return { totalSpent, netResult, closestToJackpot, winningDraws, activeTiers };
  }, [result, lottery]);

  // Format date like "Monday, March 14, 2023"
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Near-miss message
  const getNearMissMessage = (matched: number, bonusMatch: boolean) => {
    if (!lottery) return '';
    const count = lottery.mainNumbers.count;
    const bonusLabel = lottery.bonusNumber.label;

    if (matched === count && bonusMatch) return 'JACKPOT MATCH!';
    if (matched === count && !bonusMatch) return `All ${count} numbers — just missed the ${bonusLabel}!`;
    if (matched === count - 1) return 'ONE number away';
    return `${matched} out of ${count} numbers`;
  };

  // Loading state — show before input or results
  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium text-gray-900">
          Replaying {draws.length.toLocaleString()} draws...
        </p>
        <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
      </div>
    );
  }

  // Results reveal
  if (result && resultsData && lottery) {
    const { totalSpent, netResult, closestToJackpot, winningDraws, activeTiers } = resultsData;
    const hasBonus_ = lottery.bonusNumber.count > 0;

    return (
      <div className="space-y-8">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
          }
        `}</style>

        {/* 1. Back button */}
        <button
          onClick={() => setResult(null)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          &larr; Pick different numbers
        </button>

        {/* 2. Your numbers display */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Your numbers</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {selectedNumbers.map(num => (
              <span
                key={num}
                className="w-10 h-10 rounded-full bg-blue-600 text-white inline-flex items-center justify-center font-bold text-sm"
              >
                {num}
              </span>
            ))}
            {hasBonus_ && selectedBonus !== null && (
              <>
                <span className="text-gray-400 font-bold">+</span>
                <span className="w-10 h-10 rounded-full bg-red-600 text-white inline-flex items-center justify-center font-bold text-sm">
                  {selectedBonus}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 3. The Spend */}
        <div className="fade-in-up text-center py-6" style={{ animationDelay: '0ms' }}>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            If you played every {lottery.name} draw
          </p>
          <p className="text-5xl md:text-6xl font-bold text-gray-900">
            {formatCurrency(totalSpent)}
          </p>
          <p className="mt-2 text-gray-500">
            spent on {result.totalDrawsChecked.toLocaleString()} tickets at ${lottery.ticketPrice} each
          </p>
        </div>

        {/* 4. The Winnings */}
        <div className="fade-in-up text-center py-6 border-t border-gray-100" style={{ animationDelay: '300ms' }}>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            You would have won
          </p>
          <p className={`text-5xl md:text-6xl font-bold ${result.totalWinnings > 0 ? 'text-green-600' : 'text-gray-400'}`}>
            {formatCurrency(result.totalWinnings)}
          </p>
          <p className={`mt-2 font-semibold ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netResult >= 0 ? 'Net gain' : 'Net loss'}: {netResult >= 0 ? '+' : ''}{formatCurrency(netResult)}
          </p>
        </div>

        {/* 5. The Near-Miss Moment */}
        {closestToJackpot && closestToJackpot.matched >= 2 && (
          <div className="fade-in-up bg-amber-50 border border-amber-200 rounded-xl p-6 text-center" style={{ animationDelay: '600ms' }}>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wide mb-2">
              Your closest call
            </p>
            <p className="text-2xl md:text-3xl font-bold text-amber-900">
              {getNearMissMessage(closestToJackpot.matched, closestToJackpot.bonusMatch)}
            </p>
            <p className="mt-2 text-amber-700">
              on {formatDate(closestToJackpot.date)}
            </p>
            {closestToJackpot.prize > 0 && (
              <p className="mt-1 text-amber-800 font-semibold">
                Won {formatCurrency(closestToJackpot.prize)}
              </p>
            )}
          </div>
        )}

        {/* 6. Prize Breakdown Table */}
        {activeTiers.length > 0 && (
          <div className="fade-in-up border border-gray-200 rounded-xl overflow-hidden" style={{ animationDelay: '900ms' }}>
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Prize Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="px-6 py-3 font-medium">Match</th>
                    <th className="px-6 py-3 font-medium text-right">Prize</th>
                    <th className="px-6 py-3 font-medium text-right">Times</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTiers.map((tier, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-3 text-gray-900">{tier.label}</td>
                      <td className="px-6 py-3 text-right text-gray-600">
                        {typeof tier.prize === 'number' ? formatCurrency(tier.prize) : tier.prize}
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600">{tier.count}</td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(tier.totalWon)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Match History */}
        {winningDraws.length > 0 ? (
          <div className="fade-in-up" style={{ animationDelay: '900ms' }}>
            <h3 className="font-semibold text-gray-900 mb-3">
              Your Match History &mdash; {result.matchTimeline.length.toLocaleString()} winning draw{result.matchTimeline.length !== 1 ? 's' : ''}
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              {winningDraws.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {entry.matched} match{entry.matched !== 1 ? 'es' : ''}
                      {hasBonus_ && entry.bonusMatch ? ` + ${lottery.bonusNumber.label}` : ''}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +{formatCurrency(entry.prize)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 8. No Matches Fallback */
          <div className="fade-in-up text-center py-8" style={{ animationDelay: '900ms' }}>
            <p className="text-gray-500">
              No matches across {result.totalDrawsChecked.toLocaleString()} draws. Your numbers are truly unique.
            </p>
          </div>
        )}

        {/* 9. Bottom CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setResult(null)}
            className="flex-1 py-3 rounded-full font-semibold text-center bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Try Different Numbers
          </button>
          <Link
            href={`/${selectedGame}/statistics`}
            className="flex-1 py-3 rounded-full font-semibold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            See {lottery.name} Statistics &rarr;
          </Link>
        </div>

        {/* 10. Disclaimer */}
        <p className="text-xs text-gray-400 text-center">
          For entertainment purposes only. Lottery draws are random — past results do not predict future outcomes. Prize amounts shown are base prizes; actual jackpots vary by draw.
        </p>
      </div>
    );
  }

  const mainNumbersFull = selectedNumbers.length >= mainCount;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          What If You Never Missed a Draw?
        </h2>
        <p className="mt-2 text-gray-500">
          Pick your numbers. We&apos;ll replay every draw in history.
        </p>
      </div>

      {/* Game Selector — Horizontal Pills */}
      <div className="flex flex-wrap justify-center gap-2">
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

      {lottery && (
        <>
          {/* Number Counter */}
          <p className="text-center text-sm text-gray-500">
            Pick {mainCount} numbers from 1&ndash;{mainMax}{' '}
            <span className="font-semibold text-gray-700">
              ({selectedNumbers.length}/{mainCount})
            </span>
          </p>

          {/* Main Number Grid */}
          <div className={`grid ${mainMax <= 39 ? 'grid-cols-8' : 'grid-cols-7'} sm:grid-cols-10 gap-2 max-w-md sm:max-w-xl mx-auto`}>
            {Array.from({ length: mainMax }, (_, i) => i + 1).map(num => {
              const isSelected = selectedNumbers.includes(num);
              const isDisabled = !isSelected && mainNumbersFull;
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={isDisabled}
                  className={`aspect-square rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white scale-110 shadow-md'
                      : isDisabled
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Bonus Number Grid */}
          {hasBonus && (
            <div>
              <p className="text-center text-sm text-gray-500 mb-3">
                Pick your{' '}
                <span className="font-semibold text-red-600">
                  {lottery.bonusNumber.label}
                </span>{' '}
                from 1&ndash;{bonusMax}{' '}
                <span className="font-semibold text-gray-700">
                  ({selectedBonus !== null ? 1 : 0}/1)
                </span>
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md sm:max-w-xl mx-auto">
                {Array.from({ length: bonusMax }, (_, i) => i + 1).map(num => {
                  const isSelected = selectedBonus === num;
                  const isDisabled = !isSelected && selectedBonus !== null;
                  return (
                    <button
                      key={num}
                      onClick={() => toggleBonus(num)}
                      disabled={isDisabled}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white scale-110 shadow-md'
                          : isDisabled
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Numbers Display */}
          {selectedNumbers.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {selectedNumbers.map(num => (
                <span
                  key={num}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white inline-flex items-center justify-center font-bold text-sm"
                >
                  {num}
                </span>
              ))}
              {hasBonus && selectedBonus !== null && (
                <>
                  <span className="text-gray-400 font-bold">+</span>
                  <span className="w-10 h-10 rounded-full bg-red-600 text-white inline-flex items-center justify-center font-bold text-sm">
                    {selectedBonus}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Run Button */}
          <button
            onClick={handleAnalyze}
            disabled={!isReady || isAnalyzing}
            className={`w-full py-3.5 rounded-full font-semibold text-lg transition-all ${
              isReady && !isAnalyzing
                ? 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Replaying {draws.length.toLocaleString()} draws&hellip;
              </span>
            ) : (
              'Run My Numbers'
            )}
          </button>
        </>
      )}
    </div>
  );
}
