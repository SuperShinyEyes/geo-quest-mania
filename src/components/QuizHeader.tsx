import { Country } from "@/lib/countryData";

interface QuizHeaderProps {
  currentCountry: Country | null;
  isWaitingForNext: boolean;
}

export const QuizHeader = ({
  currentCountry,
  isWaitingForNext,
}: QuizHeaderProps) => {
  if (!currentCountry) {
    return (
      <div className="text-center bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isWaitingForNext) {
    return (
      <div className="text-center bg-map-correct/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg animate-pulse">
        <div className="text-2xl font-bold text-white mb-2">🎉 Correct!</div>
        <div className="text-lg text-white">Next country coming up...</div>
      </div>
    );
  }

  return (
    <div className="text-center bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
      <div className="text-sm font-medium text-gray-600 mb-1">
        Find this country:
      </div>
      <div className="text-3xl font-bold text-primary">
        {currentCountry.name}
      </div>
      <div className="text-sm text-gray-500 mt-1">
        Click on the map to guess!
      </div>
    </div>
  );
};
