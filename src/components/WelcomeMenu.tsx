import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameLevel } from "@/lib/utils";
import { WorldMap } from "./WorldMap";
import { VisitorStats } from "./VisitorStats";

export interface WelcomeMenuProps {
  setGameLevel: (gameLevel: GameLevel) => void;
}

export const WelcomeMenu = ({ setGameLevel }: WelcomeMenuProps) => {
  return (
    <div className="fixed inset-0 bg-map-ocean">
      {/* Background Map */}
      <WorldMap
        onCountryClick={() => {}} // No interaction on home page
        countryStates={{}}
        currentCountry={null}
      />

      {/* Menu Overlay */}

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-primary">🌍 Map Quiz</h1>
              <p className="text-lg text-muted-foreground">
                Test your geography knowledge
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => setGameLevel("singleplayer")}
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                🧍 Play by yourself
              </Button>

              <Button
                onClick={() => setGameLevel("multiplayer")}
                variant="outline"
                className="w-full h-14 text-lg font-semibold"
                size="lg"
              >
                👥 Play together
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <VisitorStats />
    </div>
  );
};
