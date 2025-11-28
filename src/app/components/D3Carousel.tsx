import React, {FC, useEffect, useRef} from "react";
import * as d3 from 'd3';
import {COLORS} from "@/app/components/HelpScroller";
import {measureWidth, wrap} from "@/app/components/sharedFunctions";
import {CATEGORY_COLORS} from "@/app/components/ScrollerMapChart";
import {D3DragEvent} from "d3";

export type InfoPanelData = {
    id: number;
    category: number;
    title: string;
    text: string;
    country: string;
    labelWidth?: number;
    lineCount?: number;
    lineDifference?: number;
    panelTop?: number;
    scaledTitlePath?: string;
}

type D3CarouselProps = {
    panelWidthHeight: number;
    panelData: InfoPanelData[];
    selectedDotId: number;
    setSelectedDotId: (newId: number) => void;
}

const D3Carousel: FC<D3CarouselProps> = ({
                                                     panelWidthHeight,
                                                     panelData,
    selectedDotId,
    setSelectedDotId

                                                 }) => {
    const ref = useRef(null);

    useEffect(() => {
        // svgs and sizing
        if (!ref.current) return;

        const svg = d3.select<SVGSVGElement,unknown>(ref.current);
        const svgNode = svg.node();
        if (!svgNode) return;

        const containerNode = d3.select<Element, unknown>(`.carouselContent`).node();
        if (!containerNode) return;
        const {  clientHeight: svgHeight, clientWidth:svgWidth } = containerNode;
        svg
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        const selectedPanelDataId = selectedDotId === -1 ? 0 : selectedDotId;
        const selectedPanelIndex = selectedDotId === -1 ? 0 : panelData.findIndex((f) => f.id === selectedPanelDataId);
        const extraTop = panelWidthHeight * 0.2;

        let panelStart = (svgWidth - panelWidthHeight)/2;
        const fontSize = 16;
        const bodySize = 17;
        const titleFontSize = 22;

        // links group (just a line but you could add labels etc.)
        const panelsGroup = svg
            .selectAll(".panelsGroup")
            .data(panelData)
            .join((group) => {
                const enter = group.append("g").attr("class", "panelsGroup");
                const panelGroup = enter.append("g").attr("class","panelGroup")
                panelGroup.append("text").attr("class", "countryLabel");
                panelGroup.append("path").attr("class", "boxPath");
                panelGroup.append("path").attr("class", "titlePath");
                panelGroup.append("text").attr("class", "titleLabel");
                panelGroup.append("text").attr("class", "textLabel");
                const progressGroup = enter.append("g").attr("class","progressGroup")
                progressGroup.append("text").attr("class", "progressCount");
                progressGroup.append("path").attr("class", "lineArrowLeft");
                progressGroup.append("path").attr("class", "lineArrowRight");
                return enter;
            });

        panelsGroup.attr("pointer-events","none");

        panelsGroup.select(".textLabel").selectAll("*").remove();

        panelsGroup.select(".textLabel")
            .attr("text-anchor","start")
            .attr("font-size",bodySize)
            .attr("font-weight",400)
            .attr("fill",COLORS.white)
            .text((d) => d.text)
            .attr("transform",`translate(${25},${bodySize + 85})`)
            .call(wrap,panelWidthHeight *1.25 ,bodySize);

        d3.selectAll<SVGTextElement,InfoPanelData>(".textLabel").each((d,i,objects) => {
            let labelWidth = measureWidth(d.title,titleFontSize * 0.9);
            if(labelWidth > (panelWidthHeight)){
                labelWidth = panelWidthHeight;
            }
            d.labelWidth = labelWidth;
            const titlePathWidth = 223;
            const proportion =  labelWidth/titlePathWidth;
            const bottomLeft = -21.64 * proportion;
            const topRight = -208.2874 * proportion;
            const bottomRight = -223.165 * proportion;
            d.scaledTitlePath = `M0 0L${bottomLeft} 56.1302L${topRight} 45.3069L${bottomRight} 8.1128L0 0Z`;

            const currentText = d3.select(objects[i]);
            d.lineCount = currentText.selectAll("tspan")?.nodes().length || 0;
            const maxLines = 12;
            d.lineDifference = maxLines - d.lineCount;
            d.panelTop = d.lineDifference > 2 ? (d.lineDifference - 2) * fontSize : 0;
        })

        const scaledContainerPath = (lineDifference: number) => {
            const bottomLeft = 285.024 - (lineDifference * fontSize);
            const bottomRight = 275.105 - (lineDifference * fontSize);
            return `M353.778 0.771484L0.777954 10.4954L11.1081 ${bottomLeft}L346.224 ${bottomRight}L353.778 0.771484Z`
        }

        panelsGroup.select(".countryLabel")
            .attr("text-anchor","middle")
            .attr("font-size",fontSize)
            .attr("font-weight",400)
            .attr("fill",COLORS.white)
            .attr("transform",`translate(${panelWidthHeight/2},${fontSize})`)
            .text((d) => d.country.toUpperCase());

        panelsGroup.select(".titlePath")
            .attr("fill",(d) => CATEGORY_COLORS[d.category as keyof typeof CATEGORY_COLORS])
            .attr("stroke-width",0)
            .attr("d",(d) => d.scaledTitlePath || "")
            .attr("transform",(d) => `translate(${((d.labelWidth || 0) + panelWidthHeight)/2},${fontSize})`);

        panelsGroup.select(".titleLabel")
            .attr("text-anchor","middle")
            .attr("font-size",titleFontSize)
            .attr("font-weight",700)
            .attr("fill",COLORS.white)
            .attr("transform",`translate(${panelWidthHeight/2},${fontSize + 32})`)
            .text((d) => d.title);

        panelsGroup.select(".boxPath")
            .attr("fill",COLORS.background)
            .attr("stroke", (d) => CATEGORY_COLORS[d.category as keyof typeof CATEGORY_COLORS])
            .attr("stroke-width",1)
            .attr("d",(d) => scaledContainerPath(d.lineDifference || 0))
            .attr("transform",`translate(0,${fontSize + 28})`);

        const countLabelWidth = 40;

        panelsGroup.select(".progressCount")
            .attr("text-anchor","middle")
            .attr("font-size",fontSize * 0.8)
            .attr("font-weight",400)
            .attr("fill",COLORS.white)
            .attr("transform",`translate(${panelWidthHeight/2},${panelWidthHeight - (fontSize * 0.8)})`)
            .text((d,i) =>  `${i + 1}/${panelData.length}`);

        const arrowY = panelWidthHeight - fontSize;

        panelsGroup.select(".lineArrowLeft")
            .attr("stroke-width", 0.5)
            .attr("stroke",COLORS.white)
            .attr("marker-end", (d,i) => i === 0 ? "" : "url(#arrowDef)")
            .attr("d",`M${(panelWidthHeight - countLabelWidth)/2},${arrowY} L${countLabelWidth/2},${arrowY}`);

        panelsGroup.select(".lineArrowRight")
            .attr("stroke-width", 0.5)
            .attr("stroke",COLORS.white)
            .attr("marker-end", (d,i) => i === panelData.length - 1 ? "" : "url(#arrowDef)")
            .attr("d",`M${(panelWidthHeight + countLabelWidth)/2},${arrowY} L${panelWidthHeight - countLabelWidth/2},${arrowY}`);

        const panelX = -(selectedPanelIndex * panelWidthHeight);

        const setGroupStyles = (currentPanelId: number, currentPanelIndex: number, transitionTime: number) => {

            panelsGroup.select(".progressGroup")
                .interrupt()
                .transition()
                .duration(transitionTime)
                .attr("opacity", (d) => d.id === currentPanelId ? 1 : 0)
                .attr("transform",(d,i) => `translate(${panelStart + (i * panelWidthHeight)},${d.id === currentPanelId ? 0 : extraTop}) scale(${d.id === currentPanelId ? 1 : 0.9})`)

            panelsGroup.select(".panelGroup")
                .interrupt()
                .transition()
                .duration(transitionTime)
                .attr("opacity", (d) => d.id === currentPanelId ? 1 : 0.2)
                .attr("transform",(d,i) => `translate(${panelStart + (i * panelWidthHeight)},${(d.panelTop || 0) + (d.id === currentPanelId ? 0 : extraTop)}) scale(${d.id === currentPanelId ? 1 : 0.9})`)

            const currentPanelX = -(currentPanelIndex * panelWidthHeight)
            panelsGroup
                .interrupt()
                .transition()
                .duration(transitionTime)
                .attr("transform",(d,i) => `translate(${currentPanelX},0)`);

        }

        setGroupStyles(selectedPanelDataId, selectedPanelIndex,0);



        let startX = 0;
        let dragDisabled = false;
        const dragStart = ((event: D3DragEvent<any, any, any>) => {
            svg.attr("cursor","grabbing");
            startX = event.x;
        })
        const dragging = ((event: D3DragEvent<any, any, any>) => {
            if(!dragDisabled){
                const dragPosition = startX - event.x;
                if(selectedPanelIndex === 0 &&  dragPosition < 0) return;
                if(selectedPanelIndex === panelData.length - 1 &&  dragPosition > 0) return;
                if(Math.abs(dragPosition) > 20){
                    const direction = event.x > startX ? -1: 1;
                    const newDotId = panelData[selectedPanelIndex + direction].id;
                    dragDisabled = true;
                    setGroupStyles(newDotId,selectedPanelIndex + direction,200);
                    const timer = d3.timer(() => {
                        timer.stop();
                        setSelectedDotId(newDotId);
                    },200)

                } else if (!dragDisabled){
                    panelsGroup.attr("transform",(d,i) =>
                        `translate(${panelX - dragPosition},0)`);

                }
            }
        })

        const dragEnd = (() => {
            dragDisabled = false;
            svg.attr("cursor","grab");
        })

        svg
            .attr("cursor","grab")
            .call(
            d3.drag<SVGSVGElement,unknown>()
                .on("start",dragStart)
                .on("drag",dragging)
                .on("end",dragEnd)
        )

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

    },[panelData,selectedDotId])

        return (
            <svg className="carouselContentSvg" ref={ref}>
                <defs>
                    <marker id={"arrowDef"}>
                        <path id={"arrowDefPath"}></path>
                    </marker>
                </defs>
            </svg>
        )

}
export default D3Carousel;
