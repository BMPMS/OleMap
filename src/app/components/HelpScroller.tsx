"use client"; // This marks the component to run on the client

import React, {FC, useRef, useEffect, useState} from "react";
import scrollama, {DecimalType} from "scrollama";
import * as d3 from "d3";
import ScrollerMapChart, {CATEGORY_COLORS, GeoJson} from "@/app/components/ScrollerMapChart";
import geoJson from "@/app/data/countriesNoAntarctica.json";
import mapData from "@/app/data/mapData.json";
import panelData from "@/app/data/panelsData.json";
import {MapData} from "@/app/components/ScrollerMapChart";
import InfoBoxCarousel from "@/app/components/InfoBoxCarousel";
import Carousel from "@/app/components/Carousel";
import D3Carousel from "@/app/components/D3Carousel";
export const COLORS = {
    background: "#000000",
    darkbrown: "#A28774",
    lightbrown:"#D1C0AF",
    white: "#FFFFFF"
}

const allCategories = Object.keys(CATEGORY_COLORS).map((m) => +m);

export type ScrollData = {
    description: string[];
    stage: number;
}
type LegendChartProps = {
    helpScrollData: ScrollData[];
}


const HelpScroller: FC<LegendChartProps> = ({
                                                helpScrollData,

                                            }) => {

    const basePath = process.env.NODE_ENV === 'production' ? '/OleMap' : '';
    const ref = useRef(null);
    const dataIds = panelData.map((m) => m.id);
    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set(allCategories));
    const [selectedDotId, setSelectedDotId] = useState<number>(-1)
    const [expanded, setExpanded] = useState<boolean>(false);
    const [zoomEnabled, setZoomEnabled] = useState<boolean>(false);

    const setCurrentExpanded = (newValue: boolean) => {
        setExpanded(newValue);
    }
    const resetSelectedCategories = (latestCategories: Set<number>) => {
        setSelectedCategories(latestCategories);
    }

    const resetSelectedDot = (currentId: number) => {
        if(selectedDotId === currentId || currentId === -1){
            setSelectedDotId(-1);
            setCurrentExpanded(false);
        } else {
            setSelectedDotId(currentId);
            const currentIndex = panelData.findIndex((f) => f.id === currentId);
            setCurrentExpanded(true);
        }
    }

    useEffect(() => {
        // svgs and sizing
        if (!ref.current) return;
        // initialize the scrollama
        const scroller = scrollama();
        let stepH = Math.floor(window.innerHeight * 0.35);

        const scrolly = d3.select<SVGSVGElement,unknown>(ref.current);
        const article = scrolly.select("article");

        const stepGroup = article
            .selectAll(".scrollSteps")
            .data(helpScrollData)
            .join((group) => {
                const enter = group.append("g").attr("class", "scrollSteps");
                const step = enter.append("div").attr("class", "step");
                step.append("span").attr("class","totalLabel");
                step.append("g").attr("class","stepContentGroup")

                return enter;
            });

        stepGroup.select(".step")
            .attr("data-offset", (d, i) => i === 0 ? 1 : null)
            .attr("data-step",(d,i) => i + 1)
            .style("margin-bottom",(d,i) => i === helpScrollData.length - 1 ? `${stepH * 1.5}px`:`${stepH/3}px`)

        stepGroup.select(".totalLabel")
            .style("position","absolute")
            .style("right","2rem")
            .style("font-size","0.6rem")
            .html((d,i) => `${i + 1}/${helpScrollData.length}`)

        const stepContentGroup = stepGroup.select(".stepContentGroup")
            .selectAll<SVGGElement,{text: string, showButton: boolean}[]>(".stepDescriptions")
            .data(d => d.description)
            .join((group) => {
                const enter = group.append("g").attr("class", "stepDescriptions");
                enter.append("p").attr("class","stepContent");
                return enter;
            });

        stepContentGroup.select(".stepContent")
            .attr("id",(d,i) => `stepContent${i}`)
            .html((d) => `${d}`);


        type ScrollEnterResponse = {
            direction: string;
            element: HTMLElement;
            index: number;
        }

        // scrollama event handlers
        function handleStepEnter(response: ScrollEnterResponse) {
            // set current step as active (and fixed?)
            article.selectAll(".step")
                .classed("is-active",  (d, i) => i === response.index);

        }

        // generic window resize listener event
        const  handleResize = () =>  {
            const halfHeight = Math.floor(window.innerHeight * 0.5);
            stepH = Math.min(halfHeight,200);

            // 1. update height of step elements
            article.selectAll(".step")
                .style("height",  "auto");

            // 3. tell scrollama to update new element dimensions
            scroller.resize();
        }

        handleResize();
        scroller
            .setup({
                step: "#scrolly article .step",
                offset: 0.5 as DecimalType,
                debug: false,
            })
            .onStepEnter(handleStepEnter)
            .onStepExit((response) => {
                if(response.index === 2){
                    d3.selectAll(".scrollItems")
                        .interrupt()
                        .transition()
                        .duration(500)
                        .style("opacity",0)
                        .transition()
                        .duration(0)
                        .style("display","none")
                    article
                        .interrupt()
                        .transition()
                        .duration(500)
                        .style("opacity",0);
                    scroller.disable();
                    document.body.style.overflow = 'hidden';
                    setExpanded(true);
                    setSelectedDotId(panelData[0].id);
                    const timer = d3.timer(() => {
                        setZoomEnabled(true);
                        timer.stop();
                        },500)

                }
            });


    }, [helpScrollData,selectedCategories,selectedDotId,expanded]);



    return (
        <>
        <section id="scrolly" ref={ref}>
            <figure>
                <div className="rounded-lg m-6 shadow-[inset_0_0_104px_0_#ffffff8c] bg-black flex flex-col items-center py-12 px-6 w-[calc(100vw-3rem)] h-[calc(100vh-3rem)]">
                    <img src={`${basePath}/images/fingertap.png`} className="scrollItems w-[20px] h-auto "/>
                    <div style={{ color: COLORS.darkbrown }} className={`scrollItems  p-2 text-[16px] leading-[22px] tracking-[0.07em] text-center uppercase`}>
                        INTERAKTIVE KARTE
                    </div>
                    <div style={{ color: COLORS.lightbrown }} className={`scrollItems  font-extrabold italic p-0 m-0 leading-[40px] text-[40px] text-center uppercase`}>
                        Umweltkonflikte um
                    </div>
                    <div style={{ color: COLORS.lightbrown }} className={`scrollItems  font-extrabold italic p-0 m-0 leading-[40px] text-[40px] text-center uppercase`}>
                        Energieressourcen
                    </div>
                    <br/>
                    <div className="d3ChartContainer w-full h-full">
                        <ScrollerMapChart
                            containerClass={"d3Chart"}
                            geoJson={geoJson as GeoJson}
                            mapData={mapData as MapData}
                            selectedCategories={selectedCategories}
                            dataIds={dataIds}
                            selectedDotId={selectedDotId}
                            resetSelectedDot={resetSelectedDot}
                            zoomEnabled={zoomEnabled}
                        />
                    </div>
                </div>
            </figure>
            <article>
            </article>
        </section>
            <InfoBoxCarousel
            panelData={panelData}
            size={355}
            selectedCategories={selectedCategories}
            setSelectedCategories={resetSelectedCategories}
            selectedDot={selectedDotId}
            setSelectedDotId={setSelectedDotId}
            expanded={expanded}
            setExpanded={setCurrentExpanded}
        />

     </>
    );
};

export default HelpScroller;
