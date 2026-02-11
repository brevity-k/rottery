interface LotteryBallProps {
  number: number;
  type?: 'main' | 'bonus';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LotteryBall({ number, type = 'main', size = 'md' }: LotteryBallProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  const colorClasses = type === 'bonus'
    ? 'bg-red-500 text-white'
    : 'bg-white text-gray-900 border-2 border-gray-300';

  return (
    <span className={`${sizeClasses[size]} ${colorClasses} rounded-full inline-flex items-center justify-center font-bold`}>
      {number}
    </span>
  );
}
