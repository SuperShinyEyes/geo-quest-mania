import { ScoreBoard } from "./ScoreBoard";
import { GameTimer } from "./GameTimer";
import { NameInput } from "./NameInput";
import { Leaderboard } from "./Leaderboard";
import { WorldMap } from "./WorldMap";
import { VisitorStats } from "./VisitorStats";
import { Country, getFlagByCountryCode } from "@/lib/countryData";
import { GameState, Region, LeaderboardEntry } from "@/lib/utils";
import { QuizHeader } from "./QuizHeader";

export interface SinglePlayerViewProps {
  score: number;
  currentCountry: Country | null;
  playTimeLeft: number;
  onCountryClick: (countryId: string) => void;
  countryStates: Record<string, "correct" | "wrong" | "default">;
  gameState: GameState;
  region: Region;
  submitScore: (playerName: string) => void;
  leaderboardData: LeaderboardEntry[];
  currentPlayerRank: number;
  resetGame: () => void;
}

export const SinglePlayerView = ({
  score,
  currentCountry,
  playTimeLeft,
  onCountryClick,
  countryStates,
  gameState,
  region,
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

      <QuizHeader currentCountry={currentCountry} gameState={gameState} />

      <div className="absolute top-4 right-4 z-20">
        <GameTimer timeLeft={playTimeLeft} />
      </div>

      {/* Fullscreen map */}
      <WorldMap
        onCountryClick={onCountryClick}
        countryStates={countryStates}
        currentCountry={currentCountry}
        gameState={gameState}
        region={region}
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
