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
            .attr('height', svgHeight)
            .attr("xmlns","http://www.w3.org/2000/svg");

        const selectedPanelDataId = selectedDotId === -1 ? panelData[0].id : selectedDotId;
        const selectedPanelIndex = selectedDotId === -1 ? 0 : panelData.findIndex((f) => f.id === selectedPanelDataId);
        const extraTop = panelWidthHeight * 0.2;
        const panelStart = (svgWidth - panelWidthHeight)/2;
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
                return enter;
            });

        panelsGroup.select(".panelGroup")
            .attr("pointer-events","none");

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

        const panelX = -(selectedPanelIndex * panelWidthHeight);

        const setGroupStyles = (currentPanelId: number, currentPanelIndex: number, transitionTime: number) => {

            svg.selectAll<SVGGElement,InfoPanelData>(".panelGroup")
                .transition()
                .duration(transitionTime)
                .attr("opacity", (d) => d.id === currentPanelId ? 1 : 0.2)
                .attr("transform",(d,i) => `translate(${panelStart + (i * panelWidthHeight)},${(d.panelTop || 0) + (d.id === currentPanelId ? 0 : extraTop)}) scale(${d.id === currentPanelId ? 1 : 0.9})`)

            const currentPanelX = -(currentPanelIndex * panelWidthHeight)
            svg.selectAll(".panelsGroup")
                .transition()
                .duration(transitionTime)
                .attr("transform", `translate(${currentPanelX},0)`);
        }

        queueMicrotask(() => {
            setGroupStyles(selectedPanelDataId, selectedPanelIndex,0);
        })


        let startX = 0;
        let dragDisabled = false;
        const dragStart = ((event: D3DragEvent<SVGSVGElement, undefined, undefined>) => {
            svg.attr("cursor","grabbing");
            startX = event.x;
        })
        const dragging = ((event: D3DragEvent<SVGSVGElement, undefined, undefined>) => {
            if(!dragDisabled){
                const dragPosition = startX - event.x;
                if(selectedPanelIndex === 0 &&  dragPosition < 0) return;
                if(selectedPanelIndex === panelData.length - 1 &&  dragPosition > 0) return;
                if(Math.abs(dragPosition) > 20){
                    const direction = event.x > startX ? -1: 1;
                    const newDotId = panelData[selectedPanelIndex + direction].id;
                    dragDisabled = true;
                    queueMicrotask(() => {
                        setGroupStyles(newDotId,selectedPanelIndex + direction,500);
                    })
                    const timer = d3.timer(() => {
                        timer.stop();
                        setSelectedDotId(newDotId);
                    },500)

                } else if (!dragDisabled){
                    panelsGroup.attr("transform", `translate(${panelX - dragPosition},0)`);
                }
            }
        })

        const dragEnd = (() => {
            dragDisabled = false;
            svg.attr("cursor","grab");
        })

        const carouselClick = (newIndex: number) => {
            dragDisabled = true;
            const newDotId = panelData[newIndex].id;
            //queueMicrotask(() => {
            setGroupStyles(newDotId,newIndex,500);
            const timer = d3.timer(() => {
                    timer.stop();
                    setSelectedDotId(newDotId);
                },500)
            //})

        }

        const getClickIndex = (layerX: number) => {
            if(layerX < (svgWidth - panelWidthHeight)/2){
                // clicking left
                return selectedPanelIndex === 0 ? 0 : selectedPanelIndex - 1;
            }
            return selectedPanelIndex === panelData.length - 1 ? selectedPanelIndex - 1 : selectedPanelIndex + 1;
        }
        svg
            .attr("cursor","grab")
            .on("click", (event) => {
                if (event.defaultPrevented) return; // dragged
                if(event.target.id && event.target.id.includes("lineClickableRect")){
                    // do nothing, arrow click
                } else {
                    event.preventDefault(); // Add this
                    event.stopPropagation(); // And this
                    const newIndex = getClickIndex(event.layerX)
                    carouselClick(newIndex)
                }

            })
            .call(
            d3.drag<SVGSVGElement,unknown>()
                .on("start",dragStart)
                .on("drag",dragging)
                .on("end",dragEnd)
        )

        const countLabelWidth = 40;
        svg.select(".progressCount")
            .attr("text-anchor","middle")
            .attr("font-size",fontSize * 0.8)
            .attr("font-weight",400)
            .attr("fill",COLORS.white)
            .attr("transform",`translate(${panelStart + panelWidthHeight/2},${panelWidthHeight - (fontSize * 0.8)})`)
            .text(`${selectedPanelIndex + 1}/${panelData.length}`);

        const arrowY = panelWidthHeight - fontSize;

        svg.select("#lineArrowLeft")
            .attr("stroke-width", 2.5)
            .attr("stroke-linecap","round")
            .attr("stroke",COLORS.white)
            .attr("marker-end", selectedPanelIndex === 0 ? "" : "url(#arrowDef)")
            .attr("d",`M${(panelWidthHeight - countLabelWidth)/2},${arrowY} L${countLabelWidth},${arrowY}`)
            .attr("transform",`translate(${panelStart},0)`)

        svg.select("#lineClickableRectLeft")
            .attr("pointer-events",selectedPanelIndex === 0 ? "none" :"all")
            .attr("cursor",selectedPanelIndex === 0 ? "default" :"pointer")
            .attr("width",(panelWidthHeight - countLabelWidth)/2)
            .attr("height", 14)
            .attr("fill","transparent")
            .attr("transform",`translate(${panelStart +  countLabelWidth/2},${arrowY - 7})`)
            .on("click", (event) => {
                if (event.defaultPrevented) return; // dragged
                if(selectedPanelIndex > 0){
                    carouselClick(selectedPanelIndex - 1);
                }
            });

        svg.select("#lineArrowRight")
            .attr("cursor",selectedPanelIndex === panelData.length - 1 ? "default" : "pointer")
            .attr("stroke-width", 2.5)
            .attr("stroke-linecap","round")
            .attr("stroke",COLORS.white)
            .attr("marker-end", selectedPanelIndex === panelData.length - 1 ? "" : "url(#arrowDef)")
            .attr("d",`M${(panelWidthHeight + countLabelWidth)/2},${arrowY} L${panelWidthHeight - countLabelWidth},${arrowY}`)
            .attr("transform",`translate(${panelStart},0)`)

        svg.select("#lineClickableRectRight")
            .attr("pointer-events",selectedPanelIndex === panelData.length - 1 ? "none" : "all")
            .attr("cursor",selectedPanelIndex === panelData.length - 1 ? "default" : "pointer")
            .attr("width",(panelWidthHeight - countLabelWidth)/2)
            .attr("height", 14)
            .attr("fill","transparent")
            .attr("transform",`translate(${panelStart +  panelWidthHeight/2},${arrowY - 7})`)
            .on("click", (event) => {
                if (event.defaultPrevented) return; // dragged
                if(selectedPanelIndex < panelData.length - 1){
                    carouselClick(selectedPanelIndex + 1);

                }
            });


    },[panelData,selectedDotId])

        return (
            <svg className="carouselContentSvg" ref={ref}>
                <defs>
                    <marker
                        id="arrowDef"
                        viewBox="0 -5 10 10"
                        orient="auto"
                        markerWidth="10"
                        markerHeight="10"
                        markerUnits="strokeWidth"
                        refX="4"
                        refY="0"
                    >
                        <polyline
                            points="1,-4 5,0 1,4"
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="1"
                            strokeLinecap="round"
                        />
                    </marker>
                </defs>
                <text className={"progressCount"}/>
                <rect id={"lineClickableRectLeft"}/>
                <rect id={"lineClickableRectRight"}/>
                <path id={"lineArrowLeft"} markerEnd="url(#arrowDef)"/>
                <path id={"lineArrowRight"} markerEnd="url(#arrowDef)"/>
            </svg>
        )

}
export default D3Carousel;
