import { Country } from "@/lib/countryData";
import { GameState } from "@/lib/utils";

export interface WorldMapProps {
  onCountryClick: (countryId: string) => void;
  countryStates: Record<string, "correct" | "wrong" | "default">;
  currentCountry: Country | null;
  gameState: GameState;
  syncClickAndHoverBehavior: boolean;
  oceanColor: string;
}
