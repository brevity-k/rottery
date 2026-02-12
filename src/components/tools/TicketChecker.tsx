'use client';

import { useState, useMemo } from 'react';
import LotteryBall from '@/components/lottery/LotteryBall';

interface LotteryConfig {
  slug: string;
  name: string;
  mainNumbers: { count: number; max: number };
  bonusNumber: { count: number; max: number; label: string };
}

interface DrawResult {
  date: string;
  numbers: number[];
  bonusNumber: number | null;
  drawTime?: 'midday' | 'evening';
}

interface TicketCheckerProps {
  lotteries: LotteryConfig[];
  drawsByGame: Record<string, DrawResult[]>;
}

export default function TicketChecker({ lotteries, drawsByGame }: TicketCheckerProps) {
  const [selectedGame, setSelectedGame] = useState(lotteries[0]?.slug || '');
  const [selectedDrawKey, setSelectedDrawKey] = useState('');
  const [userNumbers, setUserNumbers] = useState<string[]>([]);
  const [userBonus, setUserBonus] = useState('');
  const [result, setResult] = useState<{
    mainMatches: number[];
    bonusMatch: boolean;
    draw: DrawResult;
  } | null>(null);

  const lottery = lotteries.find(l => l.slug === selectedGame);
  const draws = useMemo(() => drawsByGame[selectedGame] || [], [drawsByGame, selectedGame]);
  const hasBonus = lottery ? lottery.bonusNumber.count > 0 : false;

  // Reset when game changes
  const handleGameChange = (slug: string) => {
    setSelectedGame(slug);
    setSelectedDrawKey('');
    const game = lotteries.find(l => l.slug === slug);
    setUserNumbers(Array(game?.mainNumbers.count || 5).fill(''));
    setUserBonus('');
    setResult(null);
  };

  // Initialize numbers array on first render
  if (userNumbers.length === 0 && lottery) {
    handleGameChange(selectedGame);
  }

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...userNumbers];
    newNumbers[index] = value;
    setUserNumbers(newNumbers);
    setResult(null);
  };

  const handleCheck = () => {
    if (!lottery || !selectedDrawKey) return;

    const draw = draws.find(d => {
      const key = d.drawTime ? `${d.date}|${d.drawTime}` : d.date;
      return key === selectedDrawKey;
    });
    if (!draw) return;

    const parsedNumbers = userNumbers.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
    if (parsedNumbers.length !== lottery.mainNumbers.count) return;

    const mainMatches = parsedNumbers.filter(n => draw.numbers.includes(n));
    const bonusMatch = hasBonus && parseInt(userBonus, 10) === draw.bonusNumber;

    setResult({ mainMatches, bonusMatch, draw });
  };

  const isValid = useMemo(() => {
    if (!lottery || !selectedDrawKey) return false;
    const parsedNumbers = userNumbers.map(n => parseInt(n, 10));
    const allValid = parsedNumbers.every(n => !isNaN(n) && n >= 1 && n <= lottery.mainNumbers.max);
    if (!allValid || parsedNumbers.length !== lottery.mainNumbers.count) return false;
    if (hasBonus) {
      const b = parseInt(userBonus, 10);
      if (isNaN(b) || b < 1 || b > lottery.bonusNumber.max) return false;
    }
    return true;
  }, [lottery, selectedDrawKey, userNumbers, userBonus, hasBonus]);

  const formatDrawLabel = (d: DrawResult) => {
    const dateStr = new Date(d.date).toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
    return d.drawTime ? `${dateStr} (${d.drawTime})` : dateStr;
  };

  return (
    <div className="space-y-6">
      {/* Game Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Game</label>
        <select
          value={selectedGame}
          onChange={e => handleGameChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {lotteries.map(l => (
            <option key={l.slug} value={l.slug}>{l.name}</option>
          ))}
        </select>
      </div>

      {/* Draw Date Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Draw Date</label>
        <select
          value={selectedDrawKey}
          onChange={e => { setSelectedDrawKey(e.target.value); setResult(null); }}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a draw date...</option>
          {draws.map((d, i) => {
            const key = d.drawTime ? `${d.date}|${d.drawTime}` : d.date;
            return (
              <option key={i} value={key}>{formatDrawLabel(d)}</option>
            );
          })}
        </select>
      </div>

      {/* Number Inputs */}
      {lottery && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Numbers ({lottery.mainNumbers.count} from 1-{lottery.mainNumbers.max})
          </label>
          <div className="flex flex-wrap gap-2">
            {userNumbers.map((val, i) => (
              <input
                key={i}
                type="number"
                min="1"
                max={lottery.mainNumbers.max}
                value={val}
                onChange={e => handleNumberChange(i, e.target.value)}
                placeholder={`#${i + 1}`}
                className="w-16 rounded-lg border border-gray-300 px-2 py-2.5 text-center text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ))}
            {hasBonus && (
              <>
                <span className="flex items-center text-gray-400 font-bold">+</span>
                <input
                  type="number"
                  min="1"
                  max={lottery.bonusNumber.max}
                  value={userBonus}
                  onChange={e => { setUserBonus(e.target.value); setResult(null); }}
                  placeholder={lottery.bonusNumber.label}
                  className="w-16 rounded-lg border border-red-300 px-2 py-2.5 text-center text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Check Button */}
      <button
        onClick={handleCheck}
        disabled={!isValid}
        className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Check My Numbers
      </button>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Results</h3>

          {/* Winning Numbers */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Winning Numbers:</p>
            <div className="flex flex-wrap gap-2">
              {result.draw.numbers.map((n, i) => (
                <LotteryBall key={i} number={n} type="main" size="md" />
              ))}
              {hasBonus && (
                <LotteryBall number={result.draw.bonusNumber!} type="bonus" size="md" />
              )}
            </div>
          </div>

          {/* Your Numbers with match highlighting */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Your Numbers:</p>
            <div className="flex flex-wrap gap-2">
              {userNumbers.map((val, i) => {
                const num = parseInt(val, 10);
                const isMatch = result.mainMatches.includes(num);
                return (
                  <span
                    key={i}
                    className={`w-10 h-10 rounded-full inline-flex items-center justify-center font-bold text-sm ${
                      isMatch
                        ? 'bg-green-500 text-white ring-2 ring-green-300'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {num}
                  </span>
                );
              })}
              {hasBonus && (
                <span
                  className={`w-10 h-10 rounded-full inline-flex items-center justify-center font-bold text-sm ${
                    result.bonusMatch
                      ? 'bg-green-500 text-white ring-2 ring-green-300'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {parseInt(userBonus, 10)}
                </span>
              )}
            </div>
          </div>

          {/* Match Summary */}
          <div className={`p-4 rounded-lg ${
            result.mainMatches.length > 0 || result.bonusMatch
              ? 'bg-green-50 border border-green-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className="font-semibold text-gray-900">
              {result.mainMatches.length} main number{result.mainMatches.length !== 1 ? 's' : ''} matched
              {hasBonus && (result.bonusMatch ? ` + ${lottery!.bonusNumber.label}!` : '')}
            </p>
            {result.mainMatches.length === 0 && !result.bonusMatch && (
              <p className="text-sm text-gray-500 mt-1">No matches this time. Better luck next draw!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
