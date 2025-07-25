import { useState, useRef } from 'react';
import { Country } from './MapQuiz';
import { COUNTRY_PATHS } from '../lib/worldMapData';

interface WorldMapProps {
  onCountryClick: (countryId: string) => void;
  countryStates: Record<string, 'correct' | 'wrong' | 'default'>;
  currentCountry: Country | null;
}

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
    // if (currentCountry && currentCountry.id === countryId && countryStates[countryId] !== 'correct') {
    //   return '#3b82f6'; // Highlight the target country
    // }
    return '#ffffff';
  };

  const getCountryStrokeWidth = (countryId: string) => {
    // if (currentCountry && currentCountry.id === countryId && countryStates[countryId] !== 'correct') {
    //   return '3';
    // }
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