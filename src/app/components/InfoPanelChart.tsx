"use client"; // This marks the component to run on the client
import type { FC } from 'react';
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
// @ts-ignore
import { geoRobinson } from "d3-geo-projection";
import {CATEGORY_COLORS} from "@/app/components/ScrollerMapChart";
import {COLORS} from "@/app/components/HelpScroller";
import {measureWidth, wrap} from "@/app/components/sharedFunctions";
import {BaseType} from "d3";

export type InfoPanelData = {
    id: number;
    category: number;
    title: string;
    text: string;
    country: string;
}
type InfoPanelChartProps = {
    widthHeight: number;
    panelData: InfoPanelData;
    index: number;
    total: number;
}
const InfoPanelChart: FC<InfoPanelChartProps> = ({
    widthHeight,
                                                     panelData,
    index,
    total,
     }) => {
    const ref = useRef(null);
     const previousData = useRef<InfoPanelData | undefined>(undefined);
    const previousIndex = useRef(-1);
    const fontSize = 16;
    const bodySize = 17;
    const titleFontSize = 22;
    useEffect(() => {
        // svgs and sizing
        if (!ref.current) return;
        if(!panelData )return;
        const direction = previousIndex.current < index ? "left" :"right";
         previousIndex.current = index;

        const svg = d3.select<SVGSVGElement, unknown>(ref.current);

        svg.attr('width', widthHeight)
            .attr('height', widthHeight);

        const countLabelWidth = 40;
        svg.select(".progressCount")
            .attr("text-anchor","middle")
            .attr("font-size",fontSize * 0.8)
            .attr("font-weight",400)
            .attr("fill",COLORS.white)
            .attr("transform",`translate(${widthHeight/2},${widthHeight - (fontSize * 0.8)})`)
            .text(`${index + 1}/${total}`);

        const arrowY = widthHeight - fontSize;
        svg.select(".lineArrowLeft")
            .attr("stroke-width",0.5)
            .attr("stroke",COLORS.white)
            .attr("marker-end", "url(#arrowDef)")
            .attr("d",`M${(widthHeight - countLabelWidth)/2},${arrowY} L${countLabelWidth/2},${arrowY}`);

        svg.select(".lineArrowRight")
            .attr("stroke-width",0.5)
            .attr("stroke",COLORS.white)
            .attr("marker-end", "url(#arrowDef)")
            .attr("d",`M${(widthHeight + countLabelWidth)/2},${arrowY} L${widthHeight - countLabelWidth/2},${arrowY}`);

        svg.select("#arrowDef")
            .attr("viewBox", "0 -5 10 10")
            .attr("orient", "auto")
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("refX", 8 );

        svg.select("#arrowDefPath")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("fill", "transparent")
            .attr("stroke",COLORS.white)
            .attr("d","M1, -4L9,0L1,4")


        const populateBoxGroup = (
            boxGroup:  d3.Selection<BaseType,unknown,HTMLElement,any>,
            boxGroupData: InfoPanelData
        ) => {

            const {category, country,title, text} = boxGroupData;
            const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];

            let labelWidth = measureWidth(title,titleFontSize * 0.9);
            if(labelWidth > (widthHeight)){
                labelWidth = widthHeight;
            }
            const titlePathWidth = 223;
            const proportion =  labelWidth/titlePathWidth;
            const bottomLeft = -21.64 * proportion;
            const topRight = -208.2874 * proportion;
            const bottomRight = -223.165 * proportion;
            const scaledTitlePath = `M0 0L${bottomLeft} 56.1302L${topRight} 45.3069L${bottomRight} 8.1128L0 0Z`;

            boxGroup.select(".countryLabel")
                .attr("text-anchor","middle")
                .attr("font-size",fontSize)
                .attr("font-weight",400)
                .attr("fill",COLORS.white)
                .attr("transform",`translate(${widthHeight/2},${fontSize})`)
                .text(country.toUpperCase());

            boxGroup.select(".titlePath")
                .attr("fill",categoryColor)
                .attr("stroke-width",0)
                .attr("d",scaledTitlePath)
                .attr("transform",`translate(${(labelWidth + widthHeight)/2},${fontSize})`);


            boxGroup.select(".titleLabel")
                .attr("text-anchor","middle")
                .attr("font-size",titleFontSize)
                .attr("font-weight",700)
                .attr("fill",COLORS.white)
                .attr("transform",`translate(${widthHeight/2},${fontSize + 32})`)
                .text(title);

            boxGroup.select(".textLabel").selectAll("*").remove();

            boxGroup.select(".textLabel")
                .attr("text-anchor","start")
                .attr("font-size",bodySize)
                .attr("font-weight",400)
                .attr("fill",COLORS.white)
                .attr("transform",`translate(${25},${bodySize + 85})`)
                .text(text)
                .call(wrap,widthHeight *1.25 ,bodySize);

            const lineCount = boxGroup.select(".textLabel").selectAll("tspan")?.nodes().length || 0;
            const maxLines = 12;
            const lineDifference = maxLines - lineCount;
            const scaledContainerPath = () => {
                const bottomLeft = 285.024 - (lineDifference * fontSize);
                const bottomRight = 275.105 - (lineDifference * fontSize);
                return `M353.778 0.771484L0.777954 10.4954L11.1081 ${bottomLeft}L346.224 ${bottomRight}L353.778 0.771484Z`
            }

            boxGroup.select(".boxPath")
                .attr("fill",COLORS.background)
                .attr("stroke", categoryColor)
                .attr("stroke-width",1)
                .attr("d",scaledContainerPath)
                .attr("transform",`translate(0,${fontSize + 28})`);
        }
        const transitionTime = 400;

        const currentBoxGroup = svg.select(".currentBoxGroup");
        populateBoxGroup(currentBoxGroup,panelData);
        currentBoxGroup
            .attr("transform",`translate(${direction === "left" ? widthHeight : -widthHeight},0)`)
            .interrupt()
            .transition()
            .duration(transitionTime)
            .attr("transform",`translate(0,0)`)


        const previousBoxGroup = svg.select(".previousBoxGroup");

        previousBoxGroup.interrupt()
            .attr("opacity",previousData.current === undefined ? 0 : 1)
            .attr("transform",`translate(0,0)`)
            .transition()
            .duration(transitionTime)
            .attr("opacity",0)
            .attr("transform",`translate(${direction === "left" ? -widthHeight : widthHeight},0)`)
            .on("end", () => {
                previousData.current = panelData;
                populateBoxGroup(previousBoxGroup,panelData);
            });

    }, [widthHeight, panelData]);

    return (
        <svg className={"noselect"} ref={ref}>
            <defs>
                <marker id={"arrowDef"}>
                    <path id={"arrowDefPath"}></path>
                </marker>
            </defs>
            <g className={"previousBoxGroup"}>
                <text className={"countryLabel"}/>
                <path className={"boxPath"}/>
                <path className={"titlePath"}/>
                <text className={"titleLabel"}/>
                <text className={"textLabel"}/>
            </g>
            <g className={"currentBoxGroup"}>
                <text className={"countryLabel"}/>
                <path className={"boxPath"}/>
                <path className={"titlePath"}/>
                <text className={"titleLabel"}/>
                <text className={"textLabel"}/>
            </g>
            <text className={"progressCount"}/>
            <path className={"lineArrowLeft"}/>
            <path className={"lineArrowRight"}/>
        </svg>
            );
            };

export default InfoPanelChart;
