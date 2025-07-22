import { useState, useRef } from 'react';
import { Country } from './MapQuiz';

interface WorldMapProps {
  onCountryClick: (countryId: string) => void;
  countryStates: Record<string, 'correct' | 'wrong' | 'default'>;
  currentCountry: Country | null;
}

// Simplified world map SVG paths - in a real app, you'd use a proper world map dataset
const COUNTRY_PATHS = {
  US: "M 158 206 L 158 164 L 220 164 L 220 206 Z",
  CA: "M 100 100 L 100 150 L 250 150 L 250 100 Z",
  MX: "M 120 220 L 120 250 L 200 250 L 200 220 Z",
  BR: "M 280 280 L 280 380 L 360 380 L 360 280 Z",
  AR: "M 260 400 L 260 480 L 320 480 L 320 400 Z",
  GB: "M 480 160 L 480 180 L 500 180 L 500 160 Z",
  FR: "M 500 180 L 500 220 L 540 220 L 540 180 Z",
  DE: "M 520 160 L 520 200 L 560 200 L 560 160 Z",
  IT: "M 540 220 L 540 270 L 570 270 L 570 220 Z",
  ES: "M 460 220 L 460 260 L 510 260 L 510 220 Z",
  RU: "M 560 100 L 560 200 L 720 200 L 720 100 Z",
  CN: "M 680 200 L 680 280 L 760 280 L 760 200 Z",
  IN: "M 640 280 L 640 340 L 700 340 L 700 280 Z",
  JP: "M 780 200 L 780 240 L 800 240 L 800 200 Z",
  AU: "M 720 400 L 720 460 L 800 460 L 800 400 Z",
  EG: "M 520 280 L 520 320 L 560 320 L 560 280 Z",
  ZA: "M 520 400 L 520 440 L 570 440 L 570 400 Z",
  NG: "M 480 320 L 480 360 L 520 360 L 520 320 Z",
};

const COUNTRY_COLORS = ['country-1', 'country-2', 'country-3', 'country-4', 'country-5', 'country-6'];

export const WorldMap = ({ onCountryClick, countryStates, currentCountry }: WorldMapProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCountryFill = (countryId: string) => {
    const state = countryStates[countryId] || 'default';
    
    if (state === 'correct') return '#22c55e'; // green-500
    if (state === 'wrong') return '#ef4444'; // red-500
    if (hoveredCountry === countryId) return 'hsl(var(--map-hover))';
    
    // Use different colors for variety
    const colorIndex = countryId.charCodeAt(0) % COUNTRY_COLORS.length;
    return `hsl(var(--map-${COUNTRY_COLORS[colorIndex]}))`;
  };

  const getCountryStroke = (countryId: string) => {
    if (currentCountry && currentCountry.id === countryId && countryStates[countryId] !== 'correct') {
      return '#3b82f6'; // Highlight the target country
    }
    return '#ffffff';
  };

  const getCountryStrokeWidth = (countryId: string) => {
    if (currentCountry && currentCountry.id === countryId && countryStates[countryId] !== 'correct') {
      return '3';
    }
    return '1';
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
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
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
            {countryStates[countryId] === 'correct' && currentCountry && (
              <text
                x={path.split(' ')[1]}
                y={path.split(' ')[2]}
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