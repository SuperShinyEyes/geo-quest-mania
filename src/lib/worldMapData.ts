import { feature } from "topojson-client";
import countriesData from "./countries-110m.json";
import { COUNTRIES } from "./countryData";

// Convert TopoJSON to GeoJSON and extract country paths
const geoData = feature(
  countriesData as any,
  countriesData.objects.countries as any
);

// Create country ID to name mapping from the TopoJSON data
export const COUNTRY_ID_MAP: Record<string, string> = {};

// Convert coordinates to SVG path
function coordinatesToPath(
  coordinates: number[][][],
  width = 900,
  height = 500
): string {
  const halfWidth = width / 2;
  const paths: string[] = [];

  // loop each ring in the polygon/multipolygon
  for (const ring of coordinates) {
    let d = "";
    let prevX: number | null = null;

    ring.forEach(([lon, lat], i) => {
      // equirectangular scale:
      const scaledX = (lon + 180) * (width / 360);
      const scaledY = (90 - lat) * (height / 180);

      // if it’s the first point, or the jump is huge (> half width),
      // start a new subpath rather than draw a line across the map
      if (
        i === 0 ||
        (prevX !== null && Math.abs(scaledX - prevX) > halfWidth)
      ) {
        if (i !== 0) d += " Z"; // close the previous subpath
        d += ` M ${scaledX} ${scaledY}`; // move to the new start
      } else {
        d += ` L ${scaledX} ${scaledY}`;
      }

      prevX = scaledX;
    });

    d += " Z"; // close this ring
    paths.push(d.trim());
  }

  // join all rings/subpaths into one big path string
  return paths.join(" ");
}

// Extract country paths from the TopoJSON data
export const COUNTRY_PATHS: Record<string, string> = {};

geoData.features.forEach((feature: any) => {
  const countryId = feature.properties.name;
  const countryCode = getCountryCode(countryId);

  if (feature.geometry.type === "Polygon") {
    COUNTRY_PATHS[countryCode] = coordinatesToPath([
      feature.geometry.coordinates[0],
    ]);
  } else if (feature.geometry.type === "MultiPolygon") {
    // For multipolygon countries, combine all polygons
    const paths = feature.geometry.coordinates.map((polygon: number[][][]) =>
      coordinatesToPath([polygon[0]])
    );
    COUNTRY_PATHS[countryCode] = paths.join(" ");
  }

  COUNTRY_ID_MAP[countryCode] = countryId;
});

// Helper function to convert country names to ISO codes
function getCountryCode(countryName: string): string {
  return COUNTRIES.find((c) => c.name === countryName)?.id; // || countryName.substring(0, 2).toUpperCase();
}
