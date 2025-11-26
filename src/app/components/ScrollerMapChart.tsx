"use client"; // This marks the component to run on the client
import type { FC } from 'react';
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
// @ts-ignore
import { geoRobinson } from "d3-geo-projection";

export const CATEGORY_COLORS = {
    7: "#AA479D",
    10:"#D94657",
    2: "#F39942",
    5: "#15A0DB",
    4: "#A28774",
    1:"#FFD000",
    3:"#AAC315"
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
    geoJson: any;
    mapData: any;
    selectedCategories: Set<number>;
    dataIds: number[];
    selectedDotId: number;
}
const ScrollerMapChart: FC<ScrollerMapChartProps> = ({
    containerClass,
    geoJson,
    mapData,
    dataIds,
    selectedDotId,
                                                     selectedCategories}) => {
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
        baseSvg.attr('width', svgWidth)
            .attr('height', svgHeight);

        const chartHeight =
            svgHeight - margin.top - margin.bottom;
        const chartWidth = svgWidth - margin.left - margin.right;


        // svg = parts which are affected by zoom
        const svg = baseSvg.select(".chartSvg");

        const projection = geoRobinson()
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
            .attr("id",(d) => d.properties.name)
            .attr("fill", "#F0F0F0")
            .attr("stroke-width",0.25)
            .attr("stroke","#A0A0A0")
            .attr("d", path);

        const categories = Object.keys(CATEGORY_COLORS)
            .map((m) => +m);

        const dotData = mapData.features
            .filter((f) => f.geometry.type === "Point")
            .reduce((acc, entry) => {
                if(categories.includes(entry.properties.category) && selectedCategories.has(entry.properties.category)){
                    acc.push({
                        coords: projection(entry.geometry.coordinates),
                        properties: entry.properties
                    })
                }
                return acc;
            },[])
            .sort((a,b) => d3.ascending(dataIds.includes(a.id) ? 0 : 1, dataIds.includes(b.id) ? 0 : 1))



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

        dataDots
            .select(".dataDot")
            .attr("r", (d) => dataIds.includes(d.properties.id) && (selectedDotId === -1 || selectedDotId === d.properties.id) ? 4 : 2)
            .attr("cx", (d) => d.coords[0])
            .attr("cy", (d) => d.coords[1])
            .attr("fill",  (d) => dataIds.includes(d.properties.id) ? CATEGORY_COLORS[d.properties.category as keyof typeof CATEGORY_COLORS] : "#808080")
            .attr("fill-opacity",(d) => dataIds.includes(d.properties.id)  ? 1 : 0.2)
            .attr("stroke-width",0)


    }, [containerClass, geoJson,mapData,selectedCategories,selectedDotId,tick]);

    return (
        <svg className={"noselect"} ref={ref}>
            <g className={"chartSvg"}>
            </g>
        </svg>
            );
            };

export default ScrollerMapChart;
