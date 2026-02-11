'use client';

import { useState, useCallback } from 'react';
import { LotteryConfig } from '@/lib/lotteries/types';
import LotteryBall from '../lottery/LotteryBall';
import Button from '../ui/Button';

interface NumberGeneratorProps {
  config: LotteryConfig;
}

export default function NumberGenerator({ config }: NumberGeneratorProps) {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [bonusNumber, setBonusNumber] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const generate = useCallback(() => {
    setIsAnimating(true);

    // Use crypto for true randomness
    const mainNums: number[] = [];
    while (mainNums.length < config.mainNumbers.count) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const num = (array[0] % config.mainNumbers.max) + 1;
      if (!mainNums.includes(num)) {
        mainNums.push(num);
      }
    }
    mainNums.sort((a, b) => a - b);

    const bonusArray = new Uint32Array(1);
    crypto.getRandomValues(bonusArray);
    const bonus = (bonusArray[0] % config.bonusNumber.max) + 1;

    setTimeout(() => {
      setNumbers(mainNums);
      setBonusNumber(bonus);
      setIsAnimating(false);
    }, 500);
  }, [config]);

  return (
    <div className="text-center">
      <div className="min-h-[80px] flex items-center justify-center gap-3 mb-6 flex-wrap">
        {numbers.length > 0 ? (
          <>
            {numbers.map((num, i) => (
              <LotteryBall key={i} number={num} type="main" size="lg" />
            ))}
            <LotteryBall number={bonusNumber} type="bonus" size="lg" />
          </>
        ) : (
          <p className="text-gray-400 text-lg">Click generate to get your numbers</p>
        )}
      </div>

      <Button onClick={generate} disabled={isAnimating} size="lg">
        {isAnimating ? 'Generating...' : numbers.length > 0 ? 'Generate Again' : 'Generate Numbers'}
      </Button>

      <p className="mt-4 text-xs text-gray-500">
        Uses cryptographically secure random number generation
      </p>
    </div>
  );
}
