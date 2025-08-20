import { useState, useEffect, useCallback } from "react";
import { WelcomeMenu } from "./WelcomeMenu";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { COUNTRIES, Country } from "@/lib/countryData";
import { supabase } from "@/integrations/supabase/client";
import {
  GameState,
  GameLevel,
  LeaderboardEntry,
  SINGLEPLAYER_ACTIVE_STATES,
  SingleplayerActiveState,
} from "@/lib/utils";
import { SinglePlayerView } from "./SinglePlayerView";
import { MultiplayerView } from "./MultiplayerView";

const TIME_REWARD = 10;
const TIME_PENALTY = 5;
const LEARN_DURATION = 2;
const PLAY_DURATION = 2;
const END_DURATION = 4;

export const MapQuiz = () => {
  // const WorldMap = isMobile() ? WorldMapMobile : WorldMapPC;
  const [score, setScore] = useState(0);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [solvedCountries, setSolvedCountries] = useState<Set<string>>(
    new Set()
  );
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);
  const [countryStates, setCountryStates] = useState<
    Record<string, "correct" | "wrong" | "default">
  >({});
  const [playTimeLeft, setPlayTimeLeft] = useState(PLAY_DURATION);
  const [endTimeLeft, setEndTimeLeft] = useState(END_DURATION);
  const [learnTimeLeft, setLearnTimeLeft] = useState(LEARN_DURATION);
  const [gameState, setGameState] = useState<GameState>("learning");
  const [gameLevel, setGameLevel] = useState<GameLevel>("singleplayer");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [currentPlayerRank, setCurrentPlayerRank] = useState<number>();

  const selectRandomCountry = useCallback(() => {
    const availableCountries = COUNTRIES.filter(
      (country) => !solvedCountries.has(country.id)
    );
    if (availableCountries.length === 0) {
      // You beat the game!
      setGameState("nameInput");
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
    setPlayTimeLeft(PLAY_DURATION);
    setEndTimeLeft(END_DURATION);
    setGameState("learning");
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

  const handleCountryHoverOnLearn = (countryId: string) => {
    const country = COUNTRIES.find((c) => c.id == countryId);
    setCurrentCountry(country);
    console.log(country);
  };

  const handleCountryClickOnPlay = (countryId: string) => {
    if (isWaitingForNext || !currentCountry || gameState !== "playing") return;

    if (countryId === currentCountry.id) {
      // Correct guess
      setScore((prev) => prev + 1);
      setPlayTimeLeft((prev) => (prev += TIME_REWARD)); // Reward 10 seconds
      setCountryStates((prev) => ({ ...prev, [countryId]: "correct" }));
      setSolvedCountries((prev) => new Set([...prev, countryId]));

      triggerConfetti();
      toast.success(`Correct! You earned ${TIME_REWARD} seconds!`);

      setIsWaitingForNext(true);
      setTimeout(() => {
        setIsWaitingForNext(false);
        selectRandomCountry();
      }, 400);
      {
        /* Wait for 800ms before the next round */
      }
    } else {
      // Wrong guess
      setPlayTimeLeft((prev) => (prev -= TIME_PENALTY));
      setCountryStates((prev) => ({ ...prev, [countryId]: "wrong" }));
      toast.error(`Wrong country! You lost ${TIME_PENALTY} seconds!`);

      // Reset wrong state after a short time
      setTimeout(() => {
        setCountryStates((prev) => ({ ...prev, [countryId]: "default" }));
      }, 1000);
    }
  };

  useEffect(() => {
    resetGame();
  }, [gameLevel]);

  // Timer effect
  useEffect(() => {
    if (gameState === "learning") {
      const learnTimer = setInterval(() => {
        setLearnTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("playing");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(learnTimer);
    }
    if (gameState === "playing") {
      // Kick off a 1-second interval for game play
      const playTimer = setInterval(() => {
        setPlayTimeLeft((prev) => {
          if (prev <= 1) {
            // If we tick down to zero (or below), switch to the ending screen…
            setGameState("ending");
            return 0;
          }
          // Otherwise just subtract one second
          return prev - 1;
        });
      }, 1000);

      // Cleanup: clear that interval whenever deps change or component unmounts
      // React calls this cleanup right before it re-runs this effect
      // (because either gameState or timeLeft changed)
      return () => clearInterval(playTimer);
    } else if (gameState === "ending") {
      const endTimer = setInterval(() => {
        setEndTimeLeft((prev) => {
          if (prev <= 1) {
            // If we tick down to zero (or below), switch to the name‐entry screen…
            setGameState("nameInput");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      // Cleanup: clear that interval whenever deps change or component unmounts
      return () => clearInterval(endTimer);
    }
    // Kick off a 1-second interval for showing last country on the map
  }, [gameState]);

  // Select a random country on start
  // Because of the absence of a dependency,
  // this effect is run only once during the mount
  useEffect(() => {
    selectRandomCountry();
  }, []);

  if (gameLevel === "welcome") {
    return <WelcomeMenu setGameLevel={setGameLevel} />;
  } else if (gameLevel === "singleplayer" && gameState === "learning") {
    return (
      <SinglePlayerView
        score={score}
        currentCountry={currentCountry}
        playTimeLeft={learnTimeLeft}
        onCountryClick={handleCountryHoverOnLearn}
        countryStates={countryStates}
        gameState={gameState}
        submitScore={submitScore}
        leaderboardData={leaderboardData}
        currentPlayerRank={currentPlayerRank}
        resetGame={resetGame}
        syncClickAndHoverBehavior={true}
      />
    );
  } else if (
    gameLevel === "singleplayer" &&
    SINGLEPLAYER_ACTIVE_STATES.includes(gameState as SingleplayerActiveState)
  ) {
    return (
      <SinglePlayerView
        score={score}
        currentCountry={currentCountry}
        playTimeLeft={playTimeLeft}
        onCountryClick={handleCountryClickOnPlay}
        countryStates={countryStates}
        gameState={gameState}
        submitScore={submitScore}
        leaderboardData={leaderboardData}
        currentPlayerRank={currentPlayerRank}
        resetGame={resetGame}
        syncClickAndHoverBehavior={false}
      />
    );
  } else if (gameLevel === "multiplayer") {
    return (
      <MultiplayerView
        score={score}
        currentCountry={currentCountry}
        timeLeft={playTimeLeft}
        onCountryClick={handleCountryClickOnPlay}
        countryStates={countryStates}
        gameState={gameState}
        submitScore={submitScore}
        leaderboardData={leaderboardData}
        currentPlayerRank={currentPlayerRank}
        resetGame={resetGame}
      />
    );
  }
};
