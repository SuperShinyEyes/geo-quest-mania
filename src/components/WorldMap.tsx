import { useState, useRef, useEffect } from "react";
import { feature as topoToGeo } from "topojson-client";
import { WorldMapProps } from "./WorldMapCommon";
import * as d3 from "d3";
import { COUNTRY_PATHS } from "../lib/worldMapData";
import { GameState } from "@/lib/utils";
import geoData from "../lib/countries-110m-with-country-code.json";
import type { FeatureCollection } from "geojson";

// ==== Constants & Theme ====
const WIDTH = 3000 as const;
const HEIGHT = 1250 as const;
const GREEN = "#22c55e" as const;
const RED = "#ef4444" as const;
const YELLOW = "#fbbf24" as const;
const GREY = "#9ca3af" as const;
const DARK_GREY = "#5b5f66" as const;
const OCEAN_BLUE = "#b3ecff" as const;
const PROGRAMMATIC_ZOOM_SPEED_IN_MS = 1500 as const;
const OCEAN_PULSE_ANIMATION_SPEED_IN_MS = 1300 as const;
const MAX_ZOOM_LEVEL = 10 as const; // 1000% seems enough for most countries.

// ==== Types ====
interface CountryProps {
  code: string; // ISO Alpha-2 in dataset
  continent_code: "AF" | "NA" | "SA" | "AS" | "EU" | "OC" | string; // You don’t want the compiler to break if something unexpected shows up in the data (e.g., \"AN\" for Antarctica).
}

type CountryFeature = Feature<Geometry, CountryProps>;

type D3SvgSel = d3.Selection<SVGSVGElement, unknown, null, undefined>;
type D3GSel = d3.Selection<SVGSVGElement, unknown, null, undefined>;

// ==== Utilities ====

const disableUserZoom = (svg: D3SvgSel) => svg.on(".zoom", null);

const enableUserZoom = (
  svg: D3SvgSel,
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>
) => svg.call(zoomBehavior);

const animateTo = (
  svg: D3SvgSel,
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
  transform: d3.ZoomTransfrom,
  ms = PROGRAMMATIC_ZOOM_SPEED_IN_MS,
  ease: (normalizedTime: number) => number = d3.easeCubic
) => {
  svg
    .transition()
    .duration(ms)
    .ease(ease)
    .call(zoomBehavior.transform, transform);
};

const zoomReset = (
  svg: D3GSel,
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
  ms
) => {
  animateTo(svg, zoomBehavior, d3.zoomIdentity, ms);
};

const zoomToBounds = (
  svg: D3SvgSel,
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
  bounds: [[number, number], [number, number]],
  padding = 40,
  ms = PROGRAMMATIC_ZOOM_SPEED_IN_MS
) => {
  // TODO: Handle edge cases
  // 1. Zoom level 10 is still small for micro countries, e.g. Solomon Isolands.
  // 2. Some countries where lands are distributed over great distance aren't well visible. Like Fiji and France.
  const [[x0, y0], [x1, y1]] = bounds;
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

const startOceanPulse = (svg: D3SvgSel, getGameState: () => string) => {
  const tick = () => {
    if (getGameState() !== "learning") return;
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
        if (getGameState() === "learning") tick();
      });
  };

  tick();
};

const stopOceanPulse = (svg: D3SvgSel) => {
  svg.interrupt("oceanPulse").style("background-color", OCEAN_BLUE);
};

const getCountryFill = (
  d: CountryFeature,
  params: {
    gameState: WorldMapProps["gameState"];
    currentCountry: WorldMapProps["currentCountry"];
    countryStates: WorldMapProps["countryStates"];
    region: WorldMapProps["region"];
  }
) => {
  const { code, continent_code } = d.properties;
  const { gameState, currentCountry, countryStates, region } = params;

  // Highlight the answer when the game ends
  if (gameState === "ending") {
    return currentCountry && currentCountry.id === code ? GREEN : GREY;
  }

  const state = countryStates[code] || "default";
  if (state === "correct") return GREEN;
  if (state === "wrong") return RED;

  // Color dark grey outside region
  if (region === "africa" && continent_code !== "AF") return DARK_GREY;
  if (region === "america" && !["SA", "NA"].includes(continent_code))
    return DARK_GREY;
  if (region === "asia" && continent_code !== "AS") return DARK_GREY;
  if (region === "europe" && continent_code !== "EU") return DARK_GREY;
  if (region === "oceania" && continent_code !== "OC") return DARK_GREY;

  return GREY;
};

const setMouseEventHandler = (
  countriesGroup: D3GSel,
  onCountryClick: (code: string) => void,
  getParams: () => {
    gameState: WorldMapProps["gameState"];
    currentCountry: WorldMapProps["currentCountry"];
    countryStates: WorldMapProps["countryStates"];
    region: WorldMapProps["region"];
  },
  syncClickAndHoverBehavior: boolean
) => {
  const paths = countriesGroup.selectAll<SVGPathElement, CountryFeature>(
    "path"
  );

  paths
    .on("mouseover", (event, d) => {
      if (syncClickAndHoverBehavior) onCountryClick(d.properties.code);
      // target is the actual <path> being hovered
      const target = event.currentTarget as SVGPathElement;

      d3.select<SVGPathElement, CountryFeature>(target)
        .attr("data-hover", "1")
        .style("fill", YELLOW); // style wins over presentation attr
    })
    .on("mouseout", (event, d) => {
      // target is the actual <path> being hovered
      const target = event.currentTarget as SVGPathElement;
      d3.select(target)
        .attr("data-hover", null)
        .style("fill", null)
        .attr("fill", getCountryFill(d, getParams()));
    })
    .on("click", (_e, d) => onCountryClick(d.properties.code));
};

export const WorldMap = ({
  onCountryClick,
  countryStates,
  currentCountry,
  gameState,
  region,
  oceanColor = OCEAN_BLUE,
}: WorldMapProps) => {
  // ==== Refs ====
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomLabelRef = useRef<HTMLDivElement>(null);

  const svgRef = useRef<D3SvgSel | null>(null);
  const countriesGroupRef = useRef<D3GSel | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  const pathRef = useRef<d3.GeoPath<any, d3.GeoPermissibleObjects> | null>(
    null
  );
  const featureByCodeRef = useRef<Map<string, any>>(new Map());

  // Keep the latest callback/props accessible to effects/listeners without re-binding
  const onCountryClickRef = useRef(onCountryClick);
  onCountryClickRef.current = onCountryClick;

  const latestParamsRef = useRef({
    gameState,
    currentCountry,
    countryStates,
    region,
  });
  latestParamsRef.current = {
    gameState,
    currentCountry,
    countryStates,
    region,
  };

  const getGameState = () => latestParamsRef.current.gameState;
  const getParams = () => latestParamsRef.current;

  // ==== Init (run once) ====
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
        if (countriesGroupRef.current) {
          countriesGroupRef.current.attr(
            "transform",
            event.transform.toString()
          );
        }
        if (zoomLabelRef.current) {
          zoomLabelRef.current.textContent = `Zoom: ${(
            event.transform.k * 100
          ).toFixed(0)}%`;
        }
      });
    zoomBehaviorRef.current = zoomBehavior;

    // create the SVG once
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)
      .style("background-color", oceanColor)
      .call(zoomBehavior);

    svgRef.current = svg;

    // container for countries
    countriesGroupRef.current = svg.append("g").attr("id", "map");

    // Draw once from TopoJSON
    const geo = topoToGeo(
      geoData,
      geoData.objects.countries
    ) as FeatureCollection<Geometry, CountryProps>;

    featureByCodeRef.current = new Map(
      geo.features.map((f: any) => [
        String(f.properties.code),
        f as CountryFeature,
      ])
    );

    // now draw exactly as before, but using geo.features
    countriesGroupRef
      .current!.selectAll("path")
      .data(geo.features as CountryFeature[])
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("class", "country")
      .attr("id", (d: any) => `country${d.properties.code}`)
      .attr("fill", (d: any) => getCountryFill(d, getParams()))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5);

    if (getGameState() === "learning") startOceanPulse(svg, getGameState);
    // clean up on unmount only
    return () => {
      stopOceanPulse(svg);
      d3.select(container).selectAll("*").remove();
    };
  }, []); // ← run exactly once

  // Watch countryStates / hover to update fills
  useEffect(() => {
    const svg = svgRef.current;
    const zoomBehavior = zoomBehaviorRef.current;
    const countriesGroup = countriesGroupRef.current;
    const path = pathRef.current;
    if (!svg || !zoomBehavior || !countriesGroup || !path) return;

    countriesGroup
      .selectAll<SVGPathElement, any>("path")
      .attr("fill", (d: any) => getCountryFill(d, getParams()))
      .attr("stroke-width", (d: any) =>
        gameState === "ending" &&
        latestParamsRef.current.currentCountry &&
        d.properties.code === latestParamsRef.current.currentCountry.id
          ? 3
          : 1.5
      );
    if (gameState === "learning") {
      console.log('gameState === "learning"');
      // Reset view & enable interaction zoom/pan during normal game play
      zoomReset(svg, zoomBehavior, PROGRAMMATIC_ZOOM_SPEED_IN_MS);
      enableUserZoom(svg, zoomBehavior);
      startOceanPulse(svgRef.current, getGameState);
      setMouseEventHandler(
        countriesGroup,
        (code) => onCountryClickRef.current(code),
        getParams,
        true
      );
      return;
    } else {
      stopOceanPulse(svg);
    }

    if (gameState === "playing") {
      enableUserZoom(svg, zoomBehavior);
      setMouseEventHandler(
        countriesGroup,
        (code) => onCountryClickRef.current(code),
        getParams,
        false
      );
      return;
    }

    if (gameState === "ending") {
      disableUserZoom(svg);

      // Highlight & focus selected country
      const feature = latestParamsRef.current.currentCountry
        ? featureByCodeRef.current.get(
            String(latestParamsRef.current.currentCountry.id)
          )
        : undefined;

      if (!feature) return;

      // Compute bounds in SVG coordinates from GeoJSON
      const bounds = path.bounds(feature) as [
        [number, number],
        [number, number]
      ];

      zoomToBounds(
        svg,
        zoomBehavior,
        bounds,
        40,
        PROGRAMMATIC_ZOOM_SPEED_IN_MS
      );
    }
  }, [gameState, currentCountry, countryStates, region]);

  return (
    <div className="fixed inset-0 bg-map-ocean">
      <div
        ref={zoomLabelRef}
        className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
      >
        Zoom: 100%
      </div>
      {/* controls and map container as before */}
      <div ref={containerRef} className="w-full h-full cursor-grab" />
    </div>
  );
};
