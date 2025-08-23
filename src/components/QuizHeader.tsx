import { Country, getFlagByCountryCode } from "@/lib/countryData";
import { GameState } from "@/lib/utils";
interface QuizHeaderProps {
  currentCountry: Country | null;
  gameState: GameState;
}

export const QuizHeader = ({ currentCountry, gameState }: QuizHeaderProps) => {
  const isCountryNotDefined =
    currentCountry === null || currentCountry === undefined;
  if (gameState === "learning" && isCountryNotDefined) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              Click & learn!
            </div>
          </div>
        </div>
      </div>
    );
  } else if (gameState === "learning" && !isCountryNotDefined) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {getFlagByCountryCode(currentCountry?.id)}{" "}
              {currentCountry?.name || "Loading..."}?
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
          <div className="text-center">
            {/* <div className="text-sm font-medium text-gray-600 mb-1">Where is</div> */}
            <div className="text-3xl font-bold text-primary">
              {getFlagByCountryCode(currentCountry?.id)}{" "}
              {currentCountry?.name || "Loading..."}?
            </div>
          </div>
        </div>
      </div>
    );
  }
};
