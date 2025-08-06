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
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Global vars to cache event state
  const [evCache, setEvCache] = useState<React.PointerEvent[]>([]);
  const [prevDiff, setPrevDiff] = useState<number>(-1);
  const [prevPanByTouchTimestamp, setPrevPanByTouchTimestamp] =
    useState<number>(Date.now());

  const handleZoom = (zoomDirection: number) => {
    const zoomSpeed = 0.09;
    const delta = zoomDirection > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    setZoom((prev) => Math.max(1.0, Math.min(20, prev * delta)));

    const rangeXAbs = (window.innerWidth / 2) * (1 - 1 / zoom);
    const rangeYAbs = (window.innerHeight / 2) * (1 - 1 / zoom);
    const clampX = Math.min(rangeXAbs, Math.max(-rangeXAbs, pan.x));
    const clampY = Math.min(rangeYAbs, Math.max(-rangeYAbs, pan.y));
    setPan({
      x: clampX,
      y: clampY,
    });
  };

  const handlePointerDown = (ev: React.PointerEvent) => {
    setEvCache((cache) => [...cache, ev]);
    handleMouseDown(ev);
    console.log("down: " + ev.pointerId);
  };

  const handlePointerMove = (ev: React.PointerEvent) => {
    // Find this event in the cache and update its record with this event
    setEvCache((cache) => {
      const newCache = cache.map((old) =>
        old.pointerId === ev.pointerId ? ev : old
      );

      if (newCache.length === 2) {
        const [p1, p2] = newCache;
        const curDiff = Math.hypot(
          p2.clientX - p1.clientX,
          p2.clientY - p1.clientY
        );

        if (prevDiff > 0) {
          if (curDiff > prevDiff) {
            handleZoom(-1);
          } else if (curDiff < prevDiff) {
            handleZoom(1);
          }
        }

        setPrevDiff(curDiff);
      } else if (newCache.length === 1) {
        handleMouseMove(ev);
      }

      return newCache;
    });
  };

  const handlePointerUp = (ev: React.PointerEvent) => {
    // Remove this pointer from the cache and reset the target's
    // background and border
    console.log("Up");
    setEvCache((cache) =>
      cache.filter((old) => old.pointerId !== ev.pointerId)
    );
    // remove_event(ev);
    // If the number of pointers down is less than two then reset diff tracker
    if (evCache.length < 2) {
      setPrevPanByTouchTimestamp(Date.now());
      setPrevDiff(-1);
    }

    if (evCache.length === 0) handleMouseUp();
  };

  function remove_event(ev: React.PointerEvent) {
    // Remove this event from the target's cache
    for (let i = 0; i < evCache.length; i++) {
      if (evCache[i].pointerId == ev.pointerId) {
        evCache.splice(i, 1);
        break;
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    handleZoom(e.deltaY);
  };
  // Begin a drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setDragStart({ x: e.clientX - pan.x * zoom, y: e.clientY - pan.y * zoom });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !svgRef.current) return;
    setIsMouseDragging(true);

    const rangeXAbs = (window.innerWidth / 2) * (1 - 1 / zoom);
    const rangeYAbs = (window.innerHeight / 2) * (1 - 1 / zoom);
    const clampX = Math.min(
      rangeXAbs,
      Math.max(-rangeXAbs, (e.clientX - dragStart.x) / zoom)
    );
    const clampY = Math.min(
      rangeYAbs,
      Math.max(-rangeYAbs, (e.clientY - dragStart.y) / zoom)
    );
    setPan({
      x: clampX,
      y: clampY,
    });
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsMouseDragging(false);
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

  const isCountryClickable = (countryId: string) => {
    // A country is clickabble if
    //   1. you're panning the map, or
    //   2. you've guessed the country correctly.
    return !isMouseDragging && countryStates[countryId] !== "correct";
  };

  const isCountryTouchable = (countryId: string) => {
    console.log(evCache.length);
    return (
      !isMouseDragging &&
      evCache.length < 2 &&
      countryStates[countryId] !== "correct"
    );
  };

  return (
    <div className="fixed inset-0 bg-map-ocean">
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
        Zoom: {(zoom * 100).toFixed(0)}%
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs">
        <div>🖱️ Click countries</div>
        <div>🎯 Scroll to zoom</div>
        <div>👆 Drag to pan</div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 900 500"
        className="touch-auto w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
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
              onMouseEnter={() => !isMouseDown && setHoveredCountry(countryId)}
              onMouseLeave={() => setHoveredCountry(null)}
              onMouseUp={(e: React.MouseEvent) => {
                if (isCountryClickable(countryId)) {
                  onCountryClick(countryId);
                }
              }}
              onPointerUp={(e: React.PointerEvent) => {
                if (isCountryTouchable(countryId)) {
                  onCountryClick(countryId);
                }
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
