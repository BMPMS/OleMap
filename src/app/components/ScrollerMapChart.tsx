"use client"; // This marks the component to run on the client
import type { FC } from 'react';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
// @ts-ignore
import { geoRobinson } from "d3-geo-projection";

type ScrollerMapChartProps = {
    containerClass: string;
    geoJson: any;
    mapData: any;
}
const ScrollerMapChart: FC<ScrollerMapChartProps> = ({
    containerClass,
    geoJson,
    mapData }) => {
    const ref = useRef(null);
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

        const categoryColors = {
            7: "#ab479d",
            10:"#df4256",
            2: "#f29943",
            5: "#1ba2db",
            4: "#a28773",
            1:"#fed000",
            3:"#aac316"
        }
        const categories = Object.keys(categoryColors)
            .map((m) => +m);

        const dotData = mapData.features
            .filter((f) => f.geometry.type === "Point")
            .reduce((acc, entry) => {
                if(categories.includes(entry.properties.category)){
                    acc.push({
                        coords: projection(entry.geometry.coordinates),
                        properties: entry.properties
                    })
                }
                return acc;
            },[]);


        debugger;

        const dataDots = svg
            .selectAll(".dataDots")
            .data(dotData.filter((f) => f.properties.category === 5))
            .join((group) => {
                const enter = group.append("g").attr("class", "dataDots");
                enter.append("circle").attr("class", "dataDot");
                return enter;
            });
        dataDots.attr("transform", `translate(${margin.left},${margin.right})`);


        dataDots
            .select(".dataDot")
            .attr("id", (d) => d.properties.category)
            .attr("r", 3)
            .attr("cx", (d) => d.coords[0])
            .attr("cy", (d) => d.coords[1])
            .attr("fill", (d) => categoryColors[d.properties.category])
            .attr("fill-opacity",0.4)
            .attr("stroke","white")
            .attr("stroke-width",0.25)
            .on("mouseover", (event, d) => {
                console.log(d.properties)
            });

    }, [containerClass, geoJson,mapData]);

    return (
        <svg className={"noselect"} ref={ref}>
            <g className={"chartSvg"}>
            </g>
        </svg>
            );
            };

export default ScrollerMapChart;
