interface JackpotDisplayProps {
  amount?: string;
  nextDraw?: string;
}

export default function JackpotDisplay({ amount, nextDraw }: JackpotDisplayProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
      <p className="text-sm font-medium opacity-90 mb-1">Estimated Jackpot</p>
      <p className="text-3xl md:text-4xl font-bold mb-2">{amount || 'Check Official Site'}</p>
      {nextDraw && <p className="text-sm opacity-75">Next Draw: {nextDraw}</p>}
    </div>
  );
}
