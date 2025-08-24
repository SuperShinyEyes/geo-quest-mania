import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Region } from "@/lib/utils";
import { WorldMap } from "./WorldMap";
import { VisitorStats } from "./VisitorStats";

export interface WelcomeMenuProps {
  startLearn: (region: Region) => void;
}

export const WelcomeMenu = ({ startLearn }: WelcomeMenuProps) => {
  return (
    <div className="fixed inset-0 bg-map-ocean">
      {/* Background Map */}
      <WorldMap
        onCountryClick={() => {}} // No interaction on home page
        countryStates={{}}
        currentCountry={null}
        gameState={"welcome"}
      />

      {/* Menu Overlay */}

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">🌍 Dingo 😄</h1>
              <p className="text-lg text-muted-foreground">
                Do you know all the 177 countries?
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => startLearn("world")}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                🗺️ World
              </Button>

              <Button
                onClick={() => startLearn("africa")}
                variant="outline"
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                Africa
              </Button>

              <Button
                onClick={() => startLearn("america")}
                variant="outline"
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                America
              </Button>

              <Button
                onClick={() => startLearn("asia")}
                variant="outline"
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                Asia
              </Button>

              <Button
                onClick={() => startLearn("europe")}
                variant="outline"
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                Europe
              </Button>

              <Button
                onClick={() => startLearn("oceania")}
                variant="outline"
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                Oceania
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <VisitorStats />
    </div>
  );
};
