import Link from 'next/link';
import { LotteryConfig, DrawResult } from '@/lib/lotteries/types';
import LotteryBall from './LotteryBall';
import { formatDate } from '@/lib/utils/formatters';

interface LotteryCardProps {
  lottery: LotteryConfig;
  latestDraw?: DrawResult;
}

export default function LotteryCard({ lottery, latestDraw }: LotteryCardProps) {
  return (
    <Link href={`/${lottery.slug}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {lottery.name}
          </h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {lottery.drawDays.join(', ')}
          </span>
        </div>

        {latestDraw && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Latest Draw: {formatDate(latestDraw.date)}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {latestDraw.numbers.map((num, i) => (
                <LotteryBall key={i} number={num} type="main" color={lottery.colors.ball} />
              ))}
              <LotteryBall number={latestDraw.bonusNumber} type="bonus" color={lottery.colors.bonusBall} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {lottery.mainNumbers.count}/{lottery.mainNumbers.max} + {lottery.bonusNumber.count}/{lottery.bonusNumber.max}
          </span>
          <span className="text-blue-600 font-medium group-hover:underline">View Details →</span>
        </div>
      </div>
    </Link>
  );
}
