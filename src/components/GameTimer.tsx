interface GameTimerProps {
  timeLeft: number;
}

export const GameTimer = ({ timeLeft }: GameTimerProps) => {
  const isLowTime = timeLeft < 10;
  
  return (
    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
      <div className="flex items-center gap-2">
        <div className="text-2xl">⏱️</div>
        <div>
          <div className="text-sm font-medium text-gray-600">Time Left</div>
          <div className={`text-2xl font-bold ${isLowTime ? 'text-red-500' : 'text-blue-500'}`}>
            {timeLeft}s
          </div>
        </div>
      </div>
    </div>
  );
};