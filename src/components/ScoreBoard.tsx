interface ScoreBoardProps {
  score: number;
}

export const ScoreBoard = ({ score }: ScoreBoardProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
      <div className="flex items-center gap-2">
        <div className="text-2xl">🏆</div>
        <div>
          {/* <div className="text-sm font-medium text-gray-600">Score</div> */}
          <div className="text-2xl font-bold text-primary">{score}</div>
        </div>
      </div>
    </div>
  );
};
