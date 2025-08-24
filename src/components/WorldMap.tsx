import { useState, useRef, useEffect } from "react";
import { feature } from "topojson-client";
import { WorldMapProps } from "./WorldMapCommon";
import * as d3 from "d3";
import { COUNTRY_PATHS } from "../lib/worldMapData";
import { GameState } from "@/lib/utils";
import geoData from "../lib/countries-110m-with-country-code.json";
import type { FeatureCollection } from "geojson";

const WIDTH = 3000,
  HEIGHT = 1250;
const GREEN = "#22c55e",
  RED = "#ef4444",
  YELLOW = "#fbbf24",
  GREY = "#9ca3af",
  DARK_GREY = "#5b5f66",
  OCEAN_BLUE = "#b3ecff";
const PROGRAMMATIC_ZOOM_SPEED_IN_MS = 1500;
const OCEAN_PULSE_ANIMATION_SPEED_IN_MS = 1300;

const setMouseEventHandler = (
  countriesGroup,
  onCountryClick,
  setHoveredCountryCode,
  syncClickAndHoverBehavior
) => {
  countriesGroup
    .selectAll<SVGPathElement, any>("path")
    .on("mouseover", (_e, d: any) => {
      setHoveredCountryCode(d.properties.code);
      if (syncClickAndHoverBehavior) {
        onCountryClick(d.properties.code);
      }
    })
    .on("mouseout", () => {
      setHoveredCountryCode(null);
    })
    .on("click", (_e, d: any) => {
      onCountryClick(d.properties.code);
    });
};

const startOceanPulse = (svg, gameStateRef) => {
  const tick = () => {
    if (gameStateRef.current !== "learning") return;
    svg
      .transition("oceanPulse")
      .duration(OCEAN_PULSE_ANIMATION_SPEED_IN_MS)
      .ease(d3.easeCubicInOut)
      .style("background-color", "#b3ffb3")
      .transition("oceanPulse")
      .duration(OCEAN_PULSE_ANIMATION_SPEED_IN_MS)
      .ease(d3.easeCubicInOut)
      .style("background-color", OCEAN_BLUE)
      .on("end", () => {
        if (gameStateRef.current === "learning") tick();
      });
  };

  tick();
};

const stopOceanPulse = (svg) => {
  svg.interrupt("oceanPulse").style("background-color", OCEAN_BLUE);
};

const disableUserInteractionZoom = (svg) => {
  svg.on(".zoom", null);
};

const enableUserInteractionZoom = (svg, zoomBehavior) => {
  svg.call(zoomBehavior);
};

const animateTo = (
  svg,
  zoomBehavior,
  transform,
  ms = 1500,
  ease = d3.easeCubic
) => {
  svg
    .transition()
    .duration(ms)
    .ease(ease)
    .call(zoomBehavior.transform, transform);
};

const zoomReset = (svg, zoomBehavior, ms) => {
  animateTo(svg, zoomBehavior, d3.zoomIdentity, ms);
};

const zoomToBounds = (
  svg,
  zoomBehavior,
  [[x0, y0], [x1, y1]],
  padding = 40,
  ms = 1000
) => {
  // TODO: Handle edge cases
  // 1. Zoom level 10 is still small for micro countries, e.g. Solomon Isolands.
  // 2. Some countries where lands are distributed over great distance aren't well visible. Like Fiji and France.

  const MAX_ZOOM_LEVEL = 10; // 1000% seems enough for most countries.
  const dx = Math.max(1, x1 - x0);
  const dy = Math.max(1, y1 - y0);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const k = Math.max(
    1,
    Math.min(
      MAX_ZOOM_LEVEL,
      0.9 * Math.min((WIDTH - 2 * padding) / dx, (HEIGHT - 2 * padding) / dy)
    )
  );
  const transform = d3.zoomIdentity
    .translate(WIDTH / 2, HEIGHT / 2)
    .scale(k)
    .translate(-cx, -cy);

  animateTo(svg, zoomBehavior, transform, ms);
};

export const WorldMap = ({
  onCountryClick,
  countryStates,
  currentCountry,
  gameState,
  region,
  oceanColor = OCEAN_BLUE,
}: WorldMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const countriesGroup = useRef<d3.Selection<
    SVGGElement,
    any,
    null,
    undefined
  > | null>(null);
  const zoomLabelRef = useRef<HTMLDivElement>(null);

  const svgRef = useRef<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  const pathRef = useRef<d3.GeoPath<any, d3.GeoPermissibleObjects> | null>(
    null
  );
  const featureByCodeRef = useRef<Map<string, any>>(new Map());

  const onCountryClickRef = useRef(onCountryClick);

  const gameStateRef = useRef<GameState>(gameState);
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(
    null
  );

  // keep the ref up-to-date but don't retrigger the init effect
  useEffect(() => {
    onCountryClickRef.current = onCountryClick;
  }, [onCountryClick]);

  const getCountryFill = (id: string, continent_code: string) => {
    // Highlight the answer when the game ends
    if (gameState === "ending") {
      if (currentCountry.id === id) {
        return GREEN;
      } else {
        return GREY;
      }
    }

    const state = countryStates[id] || "default";
    // ... same as before ...
    if (state === "correct") return GREEN;
    if (state === "wrong") return RED;
    if (region === "africa" && continent_code !== "AF") {
      return DARK_GREY;
    } else if (region === "america" && !["SA", "NA"].includes(continent_code)) {
      return DARK_GREY;
    } else if (region === "asia" && continent_code !== "AS") {
      return DARK_GREY;
    } else if (region === "europe" && continent_code !== "EU") {
      return DARK_GREY;
    } else if (region === "oceania" && continent_code !== "OC") {
      return DARK_GREY;
    }

    if (hoveredCountryCode === id) return YELLOW; // yellow for hover

    return GREY;
  };

  // Init effect
  useEffect(() => {
    if (!mapRef.current) return;

    const projection = d3
      .geoEquirectangular()
      .center([0, 15])
      .scale(WIDTH / (2 * Math.PI))
      .translate([WIDTH / 2, HEIGHT / 2]);
    const path = d3.geoPath().projection(projection);
    pathRef.current = path;

    // build the zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .on("zoom", (event) => {
        countriesGroup.current!.attr("transform", event.transform.toString());
        // update the zoom label directly, without React state
        if (zoomLabelRef.current) {
          zoomLabelRef.current.textContent = `Zoom: ${(
            event.transform.k * 100
          ).toFixed(0)}%`;
        }
      });
    zoomBehaviorRef.current = zoomBehavior;

    // create the SVG once
    const svg = d3
      .select(mapRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
      .style("background-color", oceanColor)
      .call(zoomBehavior);
    svgRef.current = svg;

    // container for countries
    countriesGroup.current = svg.append("g").attr("id", "map");

    // load & draw once
    (() => {
      // convert the Topology to a GeoJSON FeatureCollection
      // const topology: any = geoData;
      const geo = feature(
        geoData,
        geoData.objects.countries
      ) as FeatureCollection<any>;

      featureByCodeRef.current = new Map(
        geo.features.map((f: any) => [String(f.properties.code), f])
      );

      // now draw exactly as before, but using geo.features
      countriesGroup
        .current!.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("class", "country")
        .attr("id", (d: any) => `country${d.properties.code}`)
        .attr("fill", (d: any) =>
          getCountryFill(d.properties.code, d.properties.continent_code)
        )
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5);
    })();

    startOceanPulse(svgRef.current, gameStateRef);
    // clean up on unmount only
    return () => {
      stopOceanPulse(svgRef.current);
      d3.select(mapRef.current).selectAll("*").remove();
    };
  }, []); // ← run exactly once

  // Watch countryStates / hover to update fills
  useEffect(() => {
    if (!countriesGroup.current) return;
    countriesGroup.current
      .selectAll<SVGPathElement, any>("path")
      .attr("fill", (d: any) =>
        getCountryFill(d.properties.code, d.properties.continent_code)
      );
  }, [countryStates, hoveredCountryCode]);

  // Watch gameState
  useEffect(() => {
    gameStateRef.current = gameState;

    if (!svgRef.current || !zoomBehaviorRef.current || !pathRef.current) return;
    if (gameState === "learning") {
      // Reset view & enable interaction zoom/pan during normal game play
      zoomReset(
        svgRef.current,
        zoomBehaviorRef.current,
        PROGRAMMATIC_ZOOM_SPEED_IN_MS
      );
      enableUserInteractionZoom(svgRef.current, zoomBehaviorRef.current);

      startOceanPulse(svgRef.current, gameStateRef);

      setMouseEventHandler(
        countriesGroup.current,
        onCountryClickRef.current,
        setHoveredCountryCode,
        true
      );

      return;
    } else {
      stopOceanPulse(svgRef.current);
    }

    if (gameState === "playing") {
      setMouseEventHandler(
        countriesGroup.current,
        onCountryClickRef.current,
        setHoveredCountryCode,
        false
      );
    }

    if (gameState !== "ending") return;

    disableUserInteractionZoom(svgRef.current);

    countriesGroup.current
      .selectAll<SVGPathElement, any>("path")
      .attr("fill", (d: any) =>
        getCountryFill(d.properties.code, d.properties.continent_code)
      )
      .attr("stroke-width", (d: any) =>
        d.properties.code === currentCountry.id ? 3 : 1.5
      );

    const feature = featureByCodeRef.current.get(String(currentCountry.id));
    if (!feature) return;

    // Compute bounds in SVG coordinates from GeoJSON
    const bounds = pathRef.current.bounds(feature) as [
      [number, number],
      [number, number]
    ];

    zoomToBounds(
      svgRef.current,
      zoomBehaviorRef.current,
      bounds,
      40,
      PROGRAMMATIC_ZOOM_SPEED_IN_MS
    );
  }, [gameState]);

  return (
    <div className="fixed inset-0 bg-map-ocean">
      <div
        ref={zoomLabelRef}
        className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
      >
        Zoom: 100%
      </div>
      {/* controls and map container as before */}
      <div ref={mapRef} className="w-full h-full cursor-grab" />
    </div>
  );
};
