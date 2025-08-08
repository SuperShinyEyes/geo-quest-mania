import { useState, useRef, useEffect } from "react";
import { WorldMapProps } from "./WorldMapCommon";
import * as d3 from "d3";
import { COUNTRY_PATHS } from "../lib/worldMapData";

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  // const svgRef = useRef<SVGSVGElement>(null);

  const getCountryFill = (id: string) => {
    const state = countryStates[id] || "default";
    if (hoveredCountry === id) return "#fbbf24"; // hover colour
    if (state === "correct") return "#22c55e"; // green
    if (state === "wrong") return "#ef4444"; // red
    return "#d0d0d0"; // default grey
  };
  useEffect(() => {
    if (!mapRef.current) return;

    const w = 3000;
    const h = 1250;

    const projection = d3
      .geoEquirectangular()
      .center([0, 15])
      .scale(w / (2 * Math.PI))
      .translate([w / 2, h / 2]);

    const path = d3.geoPath().projection(projection);

    const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      countriesGroup.current?.attr("transform", event.transform.toString());
      setZoomLevel(event.transform.k);
    };

    const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", zoomed);

    const svg = d3
      .select(mapRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .style("background-color", "#2A2C39")
      .call(zoom);

    countriesGroup.current = svg.append("g").attr("id", "map");

    d3.json(
      "https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json"
    ).then((geo: any) => {
      countriesGroup
        .current!.selectAll("path")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("class", "country")
        .attr("id", (d: any) => `country${d.properties.iso_a2}`)
        .attr("fill", (d: any) => getCountryFill(d.properties.iso_a2))
        .attr("stroke", "#2A2C39")
        .attr("stroke-width", 1)
        .on("mouseover", (_event, d: any) => {
          setHoveredCountry(d.properties.iso_a2);
        })
        .on("mouseout", () => {
          setHoveredCountry(null);
        })
        .on("click", (_event, d: any) => {
          onCountryClick(d.properties.iso_a2);
        });

      const labels = countriesGroup
        .current!.selectAll("g.countryLabel")
        .data(geo.features)
        .enter()
        .append("g")
        .attr("class", "countryLabel")
        .attr("id", (d: any) => `countryLabel${d.properties.iso_a2}`)
        .attr("transform", (d: any) => `translate(${path.centroid(d)})`)
        .style("display", "none");

      labels
        .append("text")
        .attr("class", "countryName")
        .style("text-anchor", "middle")
        .attr("dx", 0)
        .attr("dy", 0)
        .text((d: any) => d.properties.name);
    });

    return () => {
      d3.select(mapRef.current).selectAll("*").remove();
    };
  }, [onCountryClick]);

  // update fills when state or hover changes
  useEffect(() => {
    if (!countriesGroup.current) return;
    countriesGroup.current
      .selectAll<SVGPathElement, any>("path")
      .attr("fill", (d: any) => getCountryFill(d.properties.iso_a2));
  }, [countryStates, hoveredCountry]);

  return (
    <div className="fixed inset-0 bg-map-ocean">
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
        Zoom: {(zoomLevel * 100).toFixed(0)}%
      </div>

      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs">
        <div>🖱️ Click countries</div>
        <div>🎯 Scroll to zoom</div>
        <div>👆 Drag to pan</div>
      </div>

      <div ref={mapRef} className="w-full h-full cursor-grab"></div>
    </div>
  );
};
