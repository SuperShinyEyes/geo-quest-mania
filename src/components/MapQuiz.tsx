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
  Region,
  SINGLEPLAYER_ACTIVE_STATES,
  SingleplayerActiveState,
} from "@/lib/utils";
import { SinglePlayerView } from "./SinglePlayerView";
import { MultiplayerView } from "./MultiplayerView";
import {
  TIME_REWARD_IN_S,
  TIME_PENALTY_IN_S,
  LEARN_DURATION_IN_S,
  PLAY_DURATION_IN_S,
  END_DURATION_IN_S,
} from "@/lib/timerConfigs";

export const MapQuiz = () => {
  // const WorldMap = isMobile() ? WorldMapMobile : WorldMapPC;
  const [score, setScore] = useState<number>(0);
  const [region, setRegion] = useState<Region | null>(null);
  const [countriesFilteredByRegion, setCountriesFilteredByRegion] =
    useState<Country[]>(COUNTRIES);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [solvedCountries, setSolvedCountries] = useState<Set<string>>(
    new Set()
  );
  // Prevent excessive clicks on countries
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);
  const [countryStates, setCountryStates] = useState<
    Record<string, "correct" | "wrong" | "default">
  >({});
  const [playTimeLeft, setPlayTimeLeft] = useState(PLAY_DURATION_IN_S);
  const [endTimeLeft, setEndTimeLeft] = useState(END_DURATION_IN_S);
  const [learnTimeLeft, setLearnTimeLeft] = useState(LEARN_DURATION_IN_S);
  const [gameState, setGameState] = useState<GameState>("welcome");
  const [gameLevel, setGameLevel] = useState<GameLevel>("singleplayer");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [currentPlayerRank, setCurrentPlayerRank] = useState<number>();

  const pickRandomCountry = (all: Country[], solved: Set<string>) => {
    const available = all.filter((c) => !solved.has(c.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  const selectRandomCountry = (nextSolved?: Set<string>) => {
    const solved = nextSolved ?? solvedCountries;
    const next = pickRandomCountry(countriesFilteredByRegion, solved);
    if (!next) {
      setGameState("nameInput");
    } else {
      setCurrentCountry(next);
    }
  };

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
    setLearnTimeLeft(LEARN_DURATION_IN_S);
    setPlayTimeLeft(PLAY_DURATION_IN_S);
    setSolvedCountries(new Set());
    setCountryStates({});
    setPlayTimeLeft(PLAY_DURATION_IN_S);
    setEndTimeLeft(END_DURATION_IN_S);
    setGameState("welcome");
    setIsWaitingForNext(false);
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
  };

  const handleCountryClickOnPlay = (countryId: string) => {
    if (isWaitingForNext || !currentCountry || gameState !== "playing") return;

    if (countryId === currentCountry.id) {
      // Correct guess
      setScore((prev) => prev + 1);
      setPlayTimeLeft((prev) => (prev += TIME_REWARD_IN_S)); // Reward 10 seconds
      setCountryStates((prev) => ({ ...prev, [countryId]: "correct" }));

      setSolvedCountries((prev) => {
        const nextSolved = new Set([...prev, countryId]);

        setIsWaitingForNext(true);
        setTimeout(() => {
          setIsWaitingForNext(false);
          selectRandomCountry(nextSolved);
        }, 400);

        return nextSolved;
      });
      triggerConfetti();
      toast.success(`Correct! You earned ${TIME_REWARD_IN_S} seconds!`);
    } else {
      // Wrong guess
      setPlayTimeLeft((prev) => (prev -= TIME_PENALTY_IN_S));
      setCountryStates((prev) => ({ ...prev, [countryId]: "wrong" }));
      toast.error(`Wrong country! You lost ${TIME_PENALTY_IN_S} seconds!`);

      // Reset wrong state after a short time
      setTimeout(() => {
        setCountryStates((prev) => ({ ...prev, [countryId]: "default" }));
      }, 1000);
    }
  };

  useEffect(() => {
    resetGame();
  }, [gameLevel]);

  const startLearn = (_region: Region) => {
    console.log(`startLearn ${_region}`);
    setRegion(_region);
    let filtered = null;
    switch (_region) {
      case "africa":
        filtered = COUNTRIES.filter((c) => c.continent_code === "AF");
        break;
      case "america":
        filtered = COUNTRIES.filter((c) =>
          ["NA", "SA"].includes(c.continent_code)
        );
        break;
      case "asia":
        filtered = COUNTRIES.filter((c) => c.continent_code === "AS");
        break;
      case "europe":
        filtered = COUNTRIES.filter((c) => c.continent_code === "EU");
        break;
      case "oceania":
        filtered = COUNTRIES.filter((c) => c.continent_code === "OC");
        break;
      case "world":
        filtered = COUNTRIES;
        break;
      default: {
        return;
      }
    }
    setCountriesFilteredByRegion(filtered);
    setGameState("learning");
  };

  // Timer effect
  useEffect(() => {
    if (gameState === "welcome") {
      return;
    } else if (gameState === "learning") {
      const learnTimer = setInterval(() => {
        setLearnTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("playing");
            // Select the first random country in the game
            selectRandomCountry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.info("Learn countries before the game! ⚡️", {
        duration: LEARN_DURATION_IN_S * 1000,
      });

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

  if (gameState === "welcome") {
    return <WelcomeMenu startLearn={startLearn} />;
  } else if (gameLevel === "singleplayer" && gameState === "learning") {
    return (
      <SinglePlayerView
        score={score}
        currentCountry={currentCountry}
        playTimeLeft={learnTimeLeft}
        onCountryClick={handleCountryHoverOnLearn}
        countryStates={countryStates}
        gameState={gameState}
        region={region}
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
        region={region}
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
