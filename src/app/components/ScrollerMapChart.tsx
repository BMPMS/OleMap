"use client"; // This marks the component to run on the client
import type { FC } from 'react';
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
// @ts-expect-error no typescript for this projection
import { geoRobinson } from "d3-geo-projection";
import type {Feature, Geometry, Point} from "geojson";
import {zoomToDot} from "@/app/components/sharedFunctions";

type MapProperty = {
    "id": number;
    "category": number;
    "country": string;
    "project_status": number;
    "status": number;
    "reaction": number;
    "locale": string;
    "headline": string | null;
    "name": string;
    "slug": string;
    "general": string | null;
    "commodity": string[],
    "company": string[],
    "type": string[]
}

export type MapData = {
    type: string;
    features: Feature<Point,MapProperty>[]
}

type GeoJsonProperty = {
        "name":string;
        "alpha-2":string;
        "alpha-3":string;
        "country-code":string;
        "iso_3166-2":string;
        "region":string;
        "sub-region":string;
        "intermediate-region":string;
        "region-code":string;
        "sub-region-code":string;
        "intermediate-region-code":string;
    }

export const CATEGORY_COLORS = {
    7: "#AA479D",
    10:"#D94657",
    2: "#F39942",
    5: "#15A0DB",
    4: "#A28774",
    1:"#FFD000",
    3:"#AAC315"
}

export type GeoJson = {
    type: string;
    features: Feature<Geometry,GeoJsonProperty>[]
}
export const CATEGORY_NAMES = {
    7: "Infrastruktur",
    10:"Industrie und Versorgungsanlagen",
    2: "Bergbau & andere Rohstoffaktivitäten",
    5: "Fossile Energieträger & Klimagerechtigkeit",
    4: "Biomasse und Landnutzung",
    1:"Atomkraft",
    3:"Entsorgung von Abfällen"
}
type ScrollerMapChartProps = {
    containerClass: string;
    dataIds: number[];
    mapData: MapData;
    expanded: boolean;
    geoJson: GeoJson;
    scrolling: boolean;
    selectedCategories: Set<number>;
    selectedDotId: number;
    resetSelectedDot: (currentId: number) => void;
    zoomEnabled: boolean;

}
const ScrollerMapChart: FC<ScrollerMapChartProps> = ({
            containerClass,
            mapData,
            dataIds,
            expanded,
            geoJson,
            resetSelectedDot,
            scrolling,
            selectedDotId,
            selectedCategories,
            zoomEnabled}) => {
    const ref = useRef(null);
    const [tick, setTick] = useState(0);
    // Modified hook that returns the tick value
    useEffect(() => {
        const handleResize = () => setTick(t => t + 1);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => {
        // svgs and sizing
        if (!ref.current) return;
        if(!mapData || !geoJson)return;
        const baseSvg = d3.select<SVGSVGElement, unknown>(ref.current);
        const svgNode = baseSvg.node();
        if (!svgNode) return;

        const containerNode = d3.select<Element, unknown>(`.${containerClass}Container`).node();
        if (!containerNode) return;

        const { clientWidth:svgWidth, clientHeight } = containerNode;

        const svgHeight = scrolling ? svgWidth * 0.525 : clientHeight;


        const margin = {left: 10, right: 10, top: 10, bottom: 10};

         baseSvg.attr('width', svgWidth)
           .attr('height', svgHeight);

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([ 1,10])
            .translateExtent([[0,0],[svgWidth,svgHeight]])
            .on("zoom", (event) => {
                const { x, y, k } = event.transform;
                svg.attr("transform", `translate(${x},${y}) scale(${k})`);
            });

        if(zoomEnabled){
            baseSvg.call(zoom).on("dblclick.zoom", null);
        } else {
            baseSvg.on(".zoom", null);
        }

        const chartHeight =
            svgHeight - margin.top - margin.bottom;
        const chartWidth = svgWidth - margin.left - margin.right;


        // svg = parts which are affected by zoom
        const svg = baseSvg.select(".chartSvg");

        const projection: d3.GeoProjection = geoRobinson()
            .fitSize([chartWidth, chartHeight], geoJson);

        const path = d3.geoPath(projection);

        const countryGroup = svg
            .selectAll(".countryGroup")
            .data(geoJson.features)
            .join((group) => {
                const enter = group.append("g").attr("class", "countryGroup");
                enter.append("path").attr("class", "countryPath");
                return enter;
            });

        countryGroup.attr("transform", `translate(${margin.left},${margin.right})`);

        countryGroup
            .select(".countryPath")
            .attr("id",(d) => d.properties ? d.properties.name  :"")
            .attr("fill", "#F0F0F0")
            .attr("stroke-width",0.25)
            .attr("stroke","#A0A0A0")
            .attr("d", path);

        const chartData =  mapData.features
            .filter((f) => f.geometry.type === "Point")
            .filter((f) => selectedCategories.has(f.properties.category))
            .reduce((acc, entry) => {
                if(entry.properties && entry.geometry){
                    const coords = projection(entry.geometry.coordinates as [number,number]);
                    if(coords !== null){
                        acc.push({
                            coords,
                            id: entry.properties.id,
                            category: entry.properties.category
                        })
                    }
                }
                return acc;
            },[] as {coords: [number,number], id: number, category: number}[])
            .sort((a,b) =>
                d3.descending(dataIds.includes(a.id) ? 0 : 1, dataIds.includes(b.id) ? 0 : 1))

        if(selectedDotId !== -1){
            const selectedDot = chartData.find((f) => f.id === selectedDotId);
            if(selectedDot){
                zoomToDot(baseSvg,zoom,selectedDot.coords as [number,number],svgWidth,svgHeight,expanded);
            }
        } else if (scrolling){
            baseSvg.call(zoom.transform, d3.zoomIdentity);
        }
        const dataDots = svg
            .selectAll(".dataDots")
            .data(chartData)
            .join((group) => {
                const enter = group.append("g").attr("class", "dataDots");
                enter.append("circle").attr("class", "dataOuterDot pulse");
                enter.append("circle").attr("class", "dataDot");
                return enter;
            });
        dataDots.attr("transform", `translate(${margin.left},${margin.right})`);

        dataDots
            .select(".dataOuterDot")
            .attr("visibility",(d) => !scrolling && (!expanded || selectedDotId === d.id) ? "visible" : "hidden")
            .attr("display",(d) =>  dataIds.includes(d.id) ? "block" : "none")
            .attr("r", (d) => !expanded || selectedDotId === d.id ? 5 : 0)
            .attr("cx", (d) => d.coords[0])
            .attr("cy", (d) => d.coords[1])
            .attr("fill", (d) => CATEGORY_COLORS[d.category as keyof typeof CATEGORY_COLORS])
            .attr("fill-opacity",0.5)
            .attr("stroke-width",0)
            .attr("cursor", (d) => dataIds.includes(d.id) ? "pointer" : "default")
            .on("click", (event, d) => {
                if(dataIds.includes(d.id)){
                    resetSelectedDot(d.id);
                }
            })

        const standardRadius = svgWidth < 769 ? 1 : 2;
        const panelRadius = svgWidth < 769 ? 1.5 : 3;

        dataDots
            .select(".dataDot")
            .attr("class", scrolling ? "dataDot pulse" : "dataDot")
            .attr("r",  (d) => dataIds.includes(d.id) ? panelRadius : standardRadius)
            .attr("cx", (d) => d.coords[0])
            .attr("cy", (d) => d.coords[1])
            .attr("fill", (d) => CATEGORY_COLORS[d.category as keyof typeof CATEGORY_COLORS])
          //  .attr("fill",  (d) => dataIds.includes(d.properties.id) ? CATEGORY_COLORS[d.properties.category as keyof typeof CATEGORY_COLORS] : "#808080")
            .attr("fill-opacity",(d) => dataIds.includes(d.id)  ? 1 : 0.2)
            .attr("stroke-width",0)
            .attr("cursor", (d) => dataIds.includes(d.id) ? "pointer" : "default")
            .on("click", (event, d) => {
                if(dataIds.includes(d.id)){
                    resetSelectedDot(d.id);
                }
            });

        baseSvg.on("click", (event) => {
            if(event.target.tagName !== "circle"){
                resetSelectedDot(-1);
            }
        })


    }, [containerClass, dataIds, expanded, geoJson,mapData,resetSelectedDot, scrolling,selectedCategories,selectedDotId,tick]);

    return (
        <svg className={"noselect mapSvg"} ref={ref}>
            <g className={"chartSvg"}>
            </g>
        </svg>
            );
            };

export default ScrollerMapChart;
