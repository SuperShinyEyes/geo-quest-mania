import { useState, useEffect, useCallback } from "react";
import { WorldMap } from "./WorldMap";
import { QuizHeader } from "./QuizHeader";
import { ScoreBoard } from "./ScoreBoard";
import { GameTimer } from "./GameTimer";
import { NameInput } from "./NameInput";
import { Leaderboard } from "./Leaderboard";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { COUNTRIES, Country } from "@/lib/countryData";
import { supabase } from "@/integrations/supabase/client";

type GameState = "playing" | "nameInput" | "leaderboard";

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export const MapQuiz = () => {
  const [score, setScore] = useState(0);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [solvedCountries, setSolvedCountries] = useState<Set<string>>(
    new Set()
  );
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);
  const [countryStates, setCountryStates] = useState<
    Record<string, "correct" | "wrong" | "default">
  >({});
  const [timeLeft, setTimeLeft] = useState(100);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [currentPlayerRank, setCurrentPlayerRank] = useState<number>();

  const selectRandomCountry = useCallback(() => {
    const availableCountries = COUNTRIES.filter(
      (country) => !solvedCountries.has(country.id)
    );
    if (availableCountries.length === 0) {
      // Reset if all countries have been guessed
      setSolvedCountries(new Set());
      setCurrentCountry(
        COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]
      );
    } else {
      const randomCountry =
        availableCountries[
          Math.floor(Math.random() * availableCountries.length)
        ];
      setCurrentCountry(randomCountry);
    }
    // setCountryStates({});
  }, [solvedCountries]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const resetGame = () => {
    setScore(0);
    setSolvedCountries(new Set());
    setCountryStates({});
    setTimeLeft(100);
    setGameState("playing");
    setIsWaitingForNext(false);
    selectRandomCountry();
  };

  const submitScore = async (playerName: string) => {
    try {
      const { error } = await supabase
        .from("scores")
        .insert([{ player_name: playerName, score }]);

      if (error) {
        console.error("Error submitting score:", error);
        toast.error("Failed to submit score");
        return;
      }

      // Fetch updated leaderboard
      const { data: allScores, error: fetchError } = await supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .order("created_at", { ascending: true });

      if (fetchError) {
        console.error("Error fetching leaderboard:", fetchError);
        return;
      }

      setLeaderboardData(allScores || []);

      // Find current player's rank
      const playerRank =
        (allScores || []).findIndex(
          (entry) => entry.player_name === playerName && entry.score === score
        ) + 1;

      setCurrentPlayerRank(playerRank);
      setGameState("leaderboard");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit score");
    }
  };

  const handleCountryClick = (countryId: string) => {
    if (isWaitingForNext || !currentCountry || gameState !== "playing") return;

    if (countryId === currentCountry.id) {
      // Correct guess
      setScore((prev) => prev + 1);
      setCountryStates((prev) => ({ ...prev, [countryId]: "correct" }));
      setSolvedCountries((prev) => new Set([...prev, countryId]));

      triggerConfetti();
      toast.success(`Correct! That's ${currentCountry.name}!`);

      setIsWaitingForNext(true);
      setTimeout(() => {
        setIsWaitingForNext(false);
        selectRandomCountry();
      }, 800);
      {
        /* Wait for 800ms before the next round */
      }
    } else {
      // Wrong guess
      setCountryStates((prev) => ({ ...prev, [countryId]: "wrong" }));
      toast.error("Wrong country! Try again.");

      // Reset wrong state after a short time
      setTimeout(() => {
        setCountryStates((prev) => ({ ...prev, [countryId]: "default" }));
      }, 1000);
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("nameInput");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    selectRandomCountry();
  }, [selectRandomCountry]);

  return (
    <div className="fixed inset-0 bg-map-ocean">
      {/* UI Elements positioned over the map */}
      <div className="absolute top-4 left-4 z-20">
        <ScoreBoard score={score} />
      </div>

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Where is
            </div>
            <div className="text-3xl font-bold text-primary">
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
        onCountryClick={handleCountryClick}
        countryStates={countryStates}
        currentCountry={currentCountry}
      />

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
