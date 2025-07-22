import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

// Convert TopoJSON to GeoJSON
const countries = feature(world as any, world.objects.countries as any);

// Function to convert GeoJSON coordinates to SVG path
function coordinatesToPath(coordinates: any[]): string {
  const paths: string[] = [];
  
  coordinates.forEach((ring: any[]) => {
    if (Array.isArray(ring[0])) {
      // Multi-polygon
      ring.forEach((polygon: any[]) => {
        const pathString = polygon.map((coord: [number, number], index: number) => {
          const [lon, lat] = coord;
          // Convert to SVG coordinates (simplified projection)
          const x = (lon + 180) * (900 / 360);
          const y = (90 - lat) * (500 / 180);
          return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        }).join(' ') + ' Z';
        paths.push(pathString);
      });
    } else {
      // Single polygon
      const pathString = ring.map((coord: [number, number], index: number) => {
        const [lon, lat] = coord;
        // Convert to SVG coordinates (simplified projection)
        const x = (lon + 180) * (900 / 360);
        const y = (90 - lat) * (500 / 180);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      }).join(' ') + ' Z';
      paths.push(pathString);
    }
  });
  
  return paths.join(' ');
}

// Country ID mapping from ISO codes to our quiz IDs
const COUNTRY_ID_MAP: Record<string, string> = {
  '840': 'US', // United States
  '124': 'CA', // Canada
  '484': 'MX', // Mexico
  '076': 'BR', // Brazil
  '032': 'AR', // Argentina
  '826': 'GB', // United Kingdom
  '250': 'FR', // France
  '276': 'DE', // Germany
  '380': 'IT', // Italy
  '724': 'ES', // Spain
  '643': 'RU', // Russia
  '156': 'CN', // China
  '356': 'IN', // India
  '392': 'JP', // Japan
  '036': 'AU', // Australia
  '818': 'EG', // Egypt
  '710': 'ZA', // South Africa
  '566': 'NG', // Nigeria
};

// Generate country paths from world atlas data
export const COUNTRY_PATHS: Record<string, string> = {};

countries.features.forEach((country: any) => {
  const isoCode = country.id;
  const quizId = COUNTRY_ID_MAP[isoCode];
  
  if (quizId && country.geometry) {
    const coordinates = country.geometry.coordinates;
    const pathString = coordinatesToPath(coordinates);
    COUNTRY_PATHS[quizId] = pathString;
  }
});

// Fallback paths for any missing countries (simplified versions)
const FALLBACK_PATHS: Record<string, string> = {
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

// Merge real paths with fallbacks
Object.keys(FALLBACK_PATHS).forEach(countryId => {
  if (!COUNTRY_PATHS[countryId]) {
    COUNTRY_PATHS[countryId] = FALLBACK_PATHS[countryId];
  }
});