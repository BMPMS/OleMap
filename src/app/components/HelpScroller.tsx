"use client"; // This marks the component to run on the client

import React, {FC, useRef, useEffect, useState} from "react";
import scrollama, {DecimalType} from "scrollama";
import * as d3 from "d3";
import ScrollerMapChart from "@/app/components/ScrollerMapChart";
import geoJson from "@/app/data/countriesNoAntarctica.json";
import mapData from "@/app/data/mapData.json";
import {generateNumberSvgs} from "@/app/components/InfoBoxCarousel";
import InfoBoxCarousel from "@/app/components/InfoBoxCarousel";

const colors = {
    background: "#000000",
    darkbrown: "#A28774",
    lightbrown:"#D1C0AF",
    white: "#FFFFFF"

}
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

    const ref = useRef(null);

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
            .style("margin-bottom",(d,i) => `${i === helpScrollData.length - 1 ? stepH * 2 : stepH/3}px`)


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
                .style("height", stepH + "px");

            // 3. tell scrollama to update new element dimensions
            scroller.resize();
        }

        handleResize();
        scroller
            .setup({
                step: "#scrolly article .step",
                offset: 0.33 as DecimalType,
                debug: false,
            })
            .onStepEnter(handleStepEnter)
            .onStepExit((response) => {
                if(response.index === 3){
                    d3.selectAll(".scrollItems")
                        .transition()
                        .duration(500)
                        .style("opacity",0)
                        .transition()
                        .duration(0)
                        .style("display","none")
                    article.transition()
                        .duration(500)
                        .style("opacity",0);
                    scroller.disable();
                    document.body.style.overflow = 'hidden';
                    d3.select(".infoCarousel")
                        .transition()
                        .delay(500)
                        .duration(500)
                        .style("opacity",1);
                }
            });



    }, [helpScrollData]);


    return (
        <>
        <section id="scrolly" ref={ref}>
            <figure>
                <div className="rounded-lg m-6 shadow-[inset_0_0_104px_0_#ffffff8c] bg-black flex flex-col items-center py-12 px-6 w-[calc(100vw-3rem)] h-[calc(100vh-3rem)]">
                    <img src="/images/fingertap.png" className="scrollItems w-[20px] h-auto "/>
                    <div style={{ color: colors.darkbrown }} className={`scrollItems  p-2 text-[16px] leading-[22px] tracking-[0.07em] text-center uppercase`}>
                        Nickelabbau
                    </div>
                    <div style={{ color: colors.lightbrown }} className={`scrollItems  text-[32px] text-center uppercase`}>
                        Umweltkonflikte um Energieressourcen
                    </div>
                    <div className={`text-[20px] leading-[27px] text-center scrollItems `}>
                        in Abbau, Verarbeitung und Transport von Rohstoffen für die Energiewende, seit 1851 nach dem Global Atlas of Environmental Justice, Stand September 2025
                    </div>
                    <br/>
                    <div className="d3ChartContainer w-full h-full">
                        <ScrollerMapChart
                            containerClass={"d3Chart"}
                            geoJson={geoJson}
                            mapData={mapData}
                        />
                    </div>
                </div>
            </figure>
            <article>
            </article>
        </section>
        <InfoBoxCarousel  items={generateNumberSvgs(12)} size={300} />
    </>
    );
};

export default HelpScroller;
