import { ScoreBoard } from "./ScoreBoard";
import { GameTimer } from "./GameTimer";
import { NameInput } from "./NameInput";
import { Leaderboard } from "./Leaderboard";
import { WorldMap } from "./WorldMap";
import { VisitorStats } from "./VisitorStats";
import { Country, getFlagByCountryCode } from "@/lib/countryData";
import { GameState, LeaderboardEntry } from "@/lib/utils";

export interface SinglePlayerViewProps {
  score: number;
  currentCountry: Country | null;
  timeLeft: number;
  onCountryClick: (countryId: string) => void;
  countryStates: Record<string, "correct" | "wrong" | "default">;
  gameState: GameState;
  submitScore: (playerName: string) => void;
  leaderboardData: LeaderboardEntry[];
  currentPlayerRank: number;
  resetGame: () => void;
}

export const SinglePlayerView = ({
  score,
  currentCountry,
  timeLeft,
  onCountryClick,
  countryStates,
  gameState,
  submitScore,
  leaderboardData,
  currentPlayerRank,
  resetGame,
}: SinglePlayerViewProps) => {
  return (
    <div className="fixed inset-0 bg-map-ocean">
      {/* UI Elements positioned over the map */}
      <div className="absolute top-4 left-4 z-20">
        <ScoreBoard score={score} />
      </div>

      {/* QuizHeader. It used to be in QuizHeader.tsx but Lovable decided to ignore that */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Where is
            </div>
            <div className="text-3xl font-bold text-primary">
              {getFlagByCountryCode(currentCountry?.id)}{" "}
              {currentCountry?.name || "Loading..."}?
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <GameTimer timeLeft={timeLeft} />
      </div>

      {/* Fullscreen map */}
      <WorldMap
        onCountryClick={onCountryClick}
        countryStates={countryStates}
        currentCountry={currentCountry}
      />

      <VisitorStats />

      {/* Game state overlays */}
      {gameState === "nameInput" && (
        <NameInput score={score} onSubmit={submitScore} />
      )}

      {gameState === "leaderboard" && (
        <Leaderboard
          scores={leaderboardData}
          currentPlayerRank={currentPlayerRank}
          currentPlayerName={
            leaderboardData.find(
              (entry) =>
                leaderboardData.indexOf(entry) === (currentPlayerRank || 1) - 1
            )?.player_name
          }
          currentPlayerScore={score}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
};
