import { useState, useEffect, useCallback } from 'react';
import { WorldMap } from './WorldMap';
import { QuizHeader } from './QuizHeader';
import { ScoreBoard } from './ScoreBoard';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

// Sample countries data - in a real app, this would be much more comprehensive
const COUNTRIES = [
  { id: 'US', name: 'United States' },
  { id: 'CA', name: 'Canada' },
  { id: 'MX', name: 'Mexico' },
  { id: 'BR', name: 'Brazil' },
  { id: 'AR', name: 'Argentina' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'FR', name: 'France' },
  { id: 'DE', name: 'Germany' },
  { id: 'IT', name: 'Italy' },
  { id: 'ES', name: 'Spain' },
  { id: 'RU', name: 'Russia' },
  { id: 'CN', name: 'China' },
  { id: 'IN', name: 'India' },
  { id: 'JP', name: 'Japan' },
  { id: 'AU', name: 'Australia' },
  { id: 'EG', name: 'Egypt' },
  { id: 'ZA', name: 'South Africa' },
  { id: 'NG', name: 'Nigeria' },
];

export interface Country {
  id: string;
  name: string;
}

export const MapQuiz = () => {
  const [score, setScore] = useState(0);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [guessedCountries, setGuessedCountries] = useState<Set<string>>(new Set());
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);
  const [countryStates, setCountryStates] = useState<Record<string, 'correct' | 'wrong' | 'default'>>({});

  const selectRandomCountry = useCallback(() => {
    const availableCountries = COUNTRIES.filter(country => !guessedCountries.has(country.id));
    if (availableCountries.length === 0) {
      // Reset if all countries have been guessed
      setGuessedCountries(new Set());
      setCurrentCountry(COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]);
    } else {
      const randomCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
      setCurrentCountry(randomCountry);
    }
    setCountryStates({});
  }, [guessedCountries]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
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
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleCountryClick = (countryId: string) => {
    if (isWaitingForNext || !currentCountry) return;

    if (countryId === currentCountry.id) {
      // Correct guess
      setScore(prev => prev + 1);
      setCountryStates(prev => ({ ...prev, [countryId]: 'correct' }));
      setGuessedCountries(prev => new Set([...prev, countryId]));
      
      triggerConfetti();
      toast.success(`Correct! That's ${currentCountry.name}!`);
      
      setIsWaitingForNext(true);
      setTimeout(() => {
        setIsWaitingForNext(false);
        selectRandomCountry();
      }, 5000);
    } else {
      // Wrong guess
      setScore(prev => Math.max(0, prev - 1));
      setCountryStates(prev => ({ ...prev, [countryId]: 'wrong' }));
      toast.error("Wrong country! Try again.");
      
      // Reset wrong state after a short time
      setTimeout(() => {
        setCountryStates(prev => ({ ...prev, [countryId]: 'default' }));
      }, 1000);
    }
  };

  useEffect(() => {
    selectRandomCountry();
  }, [selectRandomCountry]);

  return (
    <div className="min-h-screen bg-map-ocean p-4 flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <ScoreBoard score={score} />
          <QuizHeader 
            currentCountry={currentCountry} 
            isWaitingForNext={isWaitingForNext}
          />
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <WorldMap 
            onCountryClick={handleCountryClick}
            countryStates={countryStates}
            currentCountry={currentCountry}
          />
        </div>
      </div>
    </div>
  );
};