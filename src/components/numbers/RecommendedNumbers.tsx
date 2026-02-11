import { RecommendedSet, LotteryConfig } from '@/lib/lotteries/types';
import LotteryBall from '../lottery/LotteryBall';
import Card from '../ui/Card';

interface RecommendedNumbersProps {
  sets: RecommendedSet[];
  config: LotteryConfig;
}

export default function RecommendedNumbers({ sets, config }: RecommendedNumbersProps) {
  return (
    <div className="space-y-4">
      {sets.map((set, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Set {index + 1}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {set.strategy}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {set.numbers.map((num, i) => (
              <LotteryBall key={i} number={num} type="main" size="md" />
            ))}
            <span className="text-gray-300 mx-1">+</span>
            <LotteryBall number={set.bonusNumber} type="bonus" size="md" />
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Why these numbers?</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {set.reasoning.map((reason, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </div>
  );
}
