import { useState, useRef, useEffect } from "react";
import { Country } from "@/lib/countryData";
import { COUNTRY_PATHS } from "../lib/worldMapData";

interface WorldMapProps {
  onCountryClick: (countryId: string) => void;
  countryStates: Record<string, "correct" | "wrong" | "default">;
  currentCountry: Country | null;
}

const COUNTRY_COLORS = [
  "country-1",
  "country-2",
  "country-3",
  "country-4",
  "country-5",
  "country-6",
];

export const WorldMap = ({
  onCountryClick,
  countryStates,
  currentCountry,
}: WorldMapProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Zoom in and out on map with a scroll wheel
  // Only run once, so we don’t re-attach over and over:
  useEffect(() => {
    if (!svgRef.current) return;

    const handleRawWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.01;
      const delta = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
      setZoom((prev) => Math.max(1.0, Math.min(6, prev * delta)));
    };

    svgRef.current.addEventListener("wheel", handleRawWheel, {
      passive: false,
    });
    return () => {
      svgRef.current!.removeEventListener("wheel", handleRawWheel);
    };
  }, []); // Empty deps -> run on mount / cleanup on unmount

  // Begin a drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !svgRef.current) return;

    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCountryFill = (countryId: string) => {
    const state = countryStates[countryId] || "default";

    if (state === "correct") return "#22c55e"; // green for correct guesses
    if (state === "wrong") return "#ef4444"; // red for wrong guesses
    if (hoveredCountry === countryId) return "#fbbf24"; // yellow for hover

    // Default grey color for all countries
    return "#9ca3af"; // grey-400
  };

  const getCountryStroke = (countryId: string) => {
    // if (currentCountry && currentCountry.id === countryId && countryStates[countryId] !== 'correct') {
    //   return '#3b82f6'; // Highlight the target country
    // }
    return "#ffffff";
  };

  const getCountryStrokeWidth = (countryId: string) => {
    // if (currentCountry && currentCountry.id === countryId && countryStates[countryId] !== 'correct') {
    //   return '3';
    // }
    return "1";
  };

  return (
    <div className="relative bg-map-ocean rounded-lg shadow-2xl overflow-hidden border-4 border-white">
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
        Zoom: {(zoom * 100).toFixed(0)}%
      </div>

      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs">
        <div>🖱️ Click countries</div>
        <div>🎯 Scroll to zoom</div>
        <div>👆 Drag to pan</div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 900 500"
        className="w-full h-[600px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
            pan.y / zoom
          }px)`,
          transformOrigin: "0 0",
          transformBox: "fill-box",
        }}
      >
        {/* Ocean background */}
        <rect width="900" height="500" fill="hsl(var(--map-ocean))" />

        {/* Countries */}
        {Object.entries(COUNTRY_PATHS).map(([countryId, path]) => (
          <g key={countryId}>
            <path
              d={path}
              fill={getCountryFill(countryId)}
              stroke={getCountryStroke(countryId)}
              strokeWidth={getCountryStrokeWidth(countryId)}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => !isDragging && setHoveredCountry(countryId)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDragging) {
                  onCountryClick(countryId);
                }
              }}
            />

            {/* Country label */}
            {countryStates[countryId] === "correct" && currentCountry && (
              <text
                x={path.split(" ")[1]}
                y={path.split(" ")[2]}
                fill="white"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                className="pointer-events-none drop-shadow-sm"
              >
                {currentCountry.name}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};
