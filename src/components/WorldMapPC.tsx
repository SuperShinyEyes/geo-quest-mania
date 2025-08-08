import { useState, useRef, useEffect } from "react";
import { feature } from "topojson-client";
import { WorldMapProps } from "./WorldMapCommon";
import * as d3 from "d3";
import { COUNTRY_PATHS } from "../lib/worldMapData";
import geoData from "../lib/countries-110m-with-country-code.json";

export const WorldMapPC = ({
  onCountryClick,
  countryStates,
  currentCountry,
}: WorldMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const countriesGroup = useRef<d3.Selection<
    SVGGElement,
    any,
    null,
    undefined
  > | null>(null);
  const zoomLabelRef = useRef<HTMLDivElement>(null);
  const onCountryClickRef = useRef(onCountryClick);
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(
    null
  );

  // keep the ref up-to-date but don't retrigger the init effect
  useEffect(() => {
    onCountryClickRef.current = onCountryClick;
  }, [onCountryClick]);

  const getCountryFill = (id: string) => {
    const state = countryStates[id] || "default";
    // ... same as before ...
    if (state === "correct") return "#22c55e";
    if (state === "wrong") return "#ef4444";
    if (hoveredCountryCode === id) return "#fbbf24"; // yellow for hover
    return "#9ca3af";
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const w = 3000,
      h = 1250;
    const projection = d3
      .geoEquirectangular()
      .center([0, 15])
      .scale(w / (2 * Math.PI))
      .translate([w / 2, h / 2]);
    const path = d3.geoPath().projection(projection);

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

    // create the SVG once
    const svg = d3
      .select(mapRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .style("background-color", "#b3ecff")
      .call(zoomBehavior);

    // container for countries
    countriesGroup.current = svg.append("g").attr("id", "map");

    // load & draw once
    (() => {
      // convert the Topology to a GeoJSON FeatureCollection
      // const topology: any = geoData;
      const geo = feature(
        geoData,
        geoData.objects.countries
      ) as GeoJSON.FeatureCollection<any>;

      // now draw exactly as before, but using geo.features
      countriesGroup
        .current!.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("class", "country")
        .attr("id", (d: any) => `country${d.properties.code}`)
        .attr("fill", (d: any) => getCountryFill(d.properties.code))
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .on("mouseover", (_e, d: any) => {
          setHoveredCountryCode(d.properties.code);
        })
        .on("mouseout", () => {
          setHoveredCountryCode(null);
        })
        .on("click", (_e, d: any) => {
          onCountryClickRef.current(d.properties.code);
        });

      // labels as before…
    })();

    // clean up on unmount only
    return () => {
      d3.select(mapRef.current).selectAll("*").remove();
    };
  }, []); // ← run exactly once

  // watch countryStates / hover to update fills
  useEffect(() => {
    if (!countriesGroup.current) return;
    countriesGroup.current
      .selectAll<SVGPathElement, any>("path")
      .attr("fill", (d: any) => getCountryFill(d.properties.code));
  }, [countryStates, hoveredCountryCode]);

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
