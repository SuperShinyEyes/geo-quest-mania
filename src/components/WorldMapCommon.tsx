import { Country } from "@/lib/countryData";

export interface WorldMapProps {
  onCountryClick: (countryId: string) => void;
  countryStates: Record<string, "correct" | "wrong" | "default">;
  currentCountry: Country | null;
}
