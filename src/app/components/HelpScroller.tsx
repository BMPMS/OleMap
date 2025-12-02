"use client"; // This marks the component to run on the client

import React, {FC, useRef, useEffect, useState} from "react";
import scrollama, {DecimalType} from "scrollama";
import * as d3 from "d3";
import ScrollerMapChart, {CATEGORY_COLORS, GeoJson, MapData} from "@/app/components/ScrollerMapChart";
import geoJson from "@/app/data/countriesNoAntarctica.json";
import mapData from "@/app/data/mapData.json";
import panelData from "@/app/data/panelsData.json";
import InfoBoxCarousel from "@/app/components/InfoBoxCarousel";

export const MAP_TRANSITION = 800;

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
    const [scrolling, setScrolling] = useState<boolean>(true)
    const savedScrollPositions = useRef<{[key:number]:number}>({});
    const currentScroller = useRef<scrollama.ScrollamaInstance | undefined>(undefined)
    const setCurrentExpanded = (newValue: boolean) => {
        setExpanded(newValue);
    }
    const resetSelectedCategories = (latestCategories: Set<number>) => {
        setSelectedCategories(latestCategories);
    }

    const resetSelectedDot = (currentId: number) => {

        setSelectedDotId(currentId);
        setCurrentExpanded(currentId !== -1);

    }

    const backToScroll = () => {
        d3.select(".infoCarousel").style("opacity",0);
        document.body.style.overflow = 'auto';
        if(currentScroller.current){
            currentScroller.current.enable();
        }
        window.scrollTo(0, savedScrollPositions.current[1] + (savedScrollPositions.current[2]/4))
        d3.selectAll(".scrollItems")
            .style("opacity",1)
            .style("display","block");

        d3.selectAll(".step")
            .style("opacity",1);

        d3.select(".mapSvg").style("opacity",1);
        d3.select(".d3ChartContainer")
            .classed("scrollFinished",false);
        d3.selectAll(".dataDot")
            .classed("pulse", true);
        setSelectedDotId(-1);
        setZoomEnabled(false);
        setScrolling(true);
    }

    useEffect(() => {
        // svgs and sizing
        if (!ref.current) return;
        // initialize the scrollama
        const scroller = scrollama();
        currentScroller.current = scroller;

        const scrolly = d3.select<SVGSVGElement,unknown>(ref.current);
        const article = scrolly.select("article");

        if(scrolling){
            const stepGroup = article
                .selectAll(".scrollSteps")
                .data( helpScrollData)
        .join((group) => {
                const enter = group.append("g").attr("class", "scrollSteps");
                const step = enter.append("div").attr("class", "step");
                step.append("g").attr("class","stepContentGroup")

                return enter;
            });

            stepGroup.select(".step")
                .attr("class", (d,i) => i === 0 ? "step": "step categories")
                .attr("data-step",(d,i) => i + 1)

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

            scroller
                .setup({
                    step: "#scrolly article .step",
                    offset: 1 as DecimalType,
                    debug: false,
                    progress:true
                })
                .onStepExit((response) => {
                      savedScrollPositions.current[response.index] = window.scrollY;
                      if(response.index === 2 && response.direction === "down"){
                        d3.selectAll(".scrollItems")
                            .style("opacity",0)
                            .style("display","none");

                        d3.selectAll(".step")
                            .style("opacity",0);

                        d3.select(".mapSvg")
                            .style("opacity",0);

                        scroller.disable();
                        document.body.style.overflow = 'hidden';
                        setScrolling(false);
                        let ticker = 0
                        const interval = setInterval(() => {
                            d3.select(".infoCarousel").style("opacity",1);
                            setExpanded(true);
                            setSelectedDotId(panelData[0].id);
                            d3.select(".d3ChartContainer")
                                .classed("scrollFinished",true);
                            d3.selectAll(".dataDot")
                                .classed("pulse", false);
                            if(ticker === 2){
                                setZoomEnabled(true);
                                clearInterval(interval)
                            }
                            ticker += 1;
                        },MAP_TRANSITION)

                    }
                });
        }



    }, [helpScrollData,selectedCategories,selectedDotId,expanded]);



    return (
        <>
        <section id="scrolly" ref={ref}>
            <figure>
                <div className="bg-black flex  justify-center items-center w-screen h-screen">
                    <div className="w-screen flex flex-col justify-center items-center h-auto">
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
                        <div className="d3ChartContainer">
                            <ScrollerMapChart
                                containerClass={"d3Chart"}
                                geoJson={geoJson as GeoJson}
                                mapData={mapData as MapData}
                                selectedCategories={selectedCategories}
                                dataIds={dataIds}
                                selectedDotId={selectedDotId}
                                resetSelectedDot={resetSelectedDot}
                                zoomEnabled={zoomEnabled}
                                expanded={expanded}
                                scrolling={scrolling}
                            />
                        </div>
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
            handleBackToScroll={backToScroll}
        />

     </>
    );
};

export default HelpScroller;
