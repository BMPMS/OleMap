"use client"; // This marks the component to run on the client
import type { FC } from 'react';
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
// @ts-expect-error no typescript for this projection
import { geoRobinson } from "d3-geo-projection";
import type { Feature, Geometry, Point } from "geojson";
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

export type MapData = {
    type: string;
    features: Feature<Point,MapProperty>[]
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
    geoJson: GeoJson;
    mapData: MapData;
    selectedCategories: Set<number>;
    dataIds: number[];
    selectedDotId: number;
    resetSelectedDot: (currentId: number) => void;
    zoomEnabled: boolean
}
const ScrollerMapChart: FC<ScrollerMapChartProps> = ({
    containerClass,
    geoJson,
    mapData,
    dataIds,
    resetSelectedDot,
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
        const {  clientHeight: svgHeight, clientWidth:svgWidth } = containerNode;

        const margin = {left: 10, right: 10, top: 10, bottom: 10};

        baseSvg
            .attr('width', svgWidth)
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

        const categories = Object.keys(CATEGORY_COLORS)
            .map((m) => +m);

        const dotData = mapData.features
            .filter((f) => f.geometry.type === "Point")
            .reduce((acc, entry) => {
                if(entry.properties && entry.geometry){
                    if(categories.includes(entry.properties.category) && selectedCategories.has(entry.properties.category)){
                        const coords = projection(entry.geometry.coordinates as [number,number]);
                        if(coords !== null){
                            acc.push({
                                coords,
                                properties: entry.properties
                            })
                        }
                    }
                }
                return acc;
            },[] as {coords: [number,number], properties: MapProperty}[])
            .sort((a,b) =>
                d3.descending(dataIds.includes(a.properties.id) ? 0 : 1, dataIds.includes(b.properties.id) ? 0 : 1))


        if(selectedDotId === -1){
            baseSvg.transition()
                .duration(600)
                .call(zoom.transform, d3.zoomIdentity);
        } else {
            const selectedDot = dotData.find((f) => f.properties.id === selectedDotId);
            if(selectedDot){
                zoomToDot(baseSvg,zoom,selectedDot.coords,svgWidth,svgHeight);
            }
        }

        const dataDots = svg
            .selectAll(".dataDots")
            .data(dotData)
            .join((group) => {
                const enter = group.append("g").attr("class", "dataDots");
                enter.append("circle").attr("class", "dataDot");
                enter.append("circle").attr("class", "dataOuterDot");
                return enter;
            });
        dataDots.attr("transform", `translate(${margin.left},${margin.right})`);

        dataDots
            .select(".dataOuterDot")
            .attr("display",(d) => selectedDotId === -1 || selectedDotId === d.properties.id ? "block" : "none")
            .attr("class",(d) =>  dataIds.includes(d.properties.id) ? "dataOuterDot pulse" : "dataOuterDot")
            .attr("r", (d) => dataIds.includes(d.properties.id) ? 6 : 0)
            .attr("cx", (d) => d.coords[0])
            .attr("cy", (d) => d.coords[1])
            .attr("fill", "transparent")
            .attr("stroke", (d) => CATEGORY_COLORS[d.properties.category as keyof typeof CATEGORY_COLORS])
            .attr("fill-opacity",(d) => dataIds.includes(d.properties.id) ? 1 : 0.4)
            .attr("stroke-width",(d) => dataIds.includes(d.properties.id) ? 1.5 : 0)
            .attr("cursor", (d) => dataIds.includes(d.properties.id) ? "pointer" : "default")
            .on("click", (event, d) => {
                if(dataIds.includes(d.properties.id)){
                    resetSelectedDot(d.properties.id);
                }
            })

        dataDots
            .select(".dataDot")
            .attr("r", (d) => dataIds.includes(d.properties.id)  ? 4 : 2)
            .attr("cx", (d) => d.coords[0])
            .attr("cy", (d) => d.coords[1])
            .attr("fill", (d) => CATEGORY_COLORS[d.properties.category as keyof typeof CATEGORY_COLORS])
          //  .attr("fill",  (d) => dataIds.includes(d.properties.id) ? CATEGORY_COLORS[d.properties.category as keyof typeof CATEGORY_COLORS] : "#808080")
            .attr("fill-opacity",(d) => dataIds.includes(d.properties.id)  ? 1 : 0.2)
            .attr("stroke-width",0)
            .attr("cursor", (d) => dataIds.includes(d.properties.id) ? "pointer" : "default")
            .on("click", (event, d) => {
                if(dataIds.includes(d.properties.id)){
                    resetSelectedDot(d.properties.id);
                }
            });

        baseSvg.on("click", (event) => {
            if(event.target.tagName !== "circle"){
                resetSelectedDot(-1);
            }
        })


    }, [containerClass, dataIds, geoJson,mapData,resetSelectedDot, selectedCategories,selectedDotId,tick]);

    return (
        <svg className={"noselect"} ref={ref}>
            <g className={"chartSvg"}>
            </g>
        </svg>
            );
            };

export default ScrollerMapChart;
