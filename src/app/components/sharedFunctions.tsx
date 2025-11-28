import * as d3 from 'd3';
import {BaseType} from "d3";
import {InfoPanelData} from "@/app/components/D3Carousel";
export const measureWidth = (text: string, fontSize: number) => {
    const context = document.createElement("canvas").getContext("2d");
    if(!context) return 0;
    context.font = `${fontSize}px Arial`;
    return context.measureText(text).width;
}
export const wrap = (
    text: d3.Selection<BaseType, InfoPanelData, SVGGElement, undefined>,
    width: number,
    fontSize: number
): void => {
    text.each(function () {
        const textElem = d3.select(this);
        const words = textElem.text().split(/\s+/).reverse();
        let word: string | undefined;
        let line: string[] = [];
        let lineNumber = 1;
        const y = textElem.attr("y");
        const dy = 0;

        let tspan = textElem
            .text(null)
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", dy)
            .attr("nothing",lineNumber)

        while ((word = words.pop())) {
            line.push(word);
            const currentText = line.join(" ");
            tspan.text(currentText);
            if (measureWidth(currentText, fontSize) > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                if (word.trim() !== "") {
                    if (tspan.text().trim() === "") {
                        tspan.text(word);
                    } else {
                        lineNumber += 1;
                        tspan = textElem
                            .append("tspan")
                            .attr("x", 0)
                            .attr("y", y)
                            .attr("dy", fontSize * 1.1)
                            .text(word);
                    }
                }
            }
        }
    });
};


export const zoomToDot = (
    baseSvg: d3.Selection<SVGSVGElement, unknown, HTMLElement, undefined>,
    zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
    dotCoords: [number,number],
    svgWidth: number,
    svgHeight: number) => {

    // Calculate the transform to center on (x, y) at the desired scale
    const transform = d3.zoomIdentity
        .translate(svgWidth / 2, svgHeight / 2) // move center of svg to 0,0
        .scale(3)
        .translate(-dotCoords[0], -dotCoords[1]); // move target point to center

    // Animate the zoom
    baseSvg.transition()
        .duration(600)
        .call(zoom.transform, transform);
};
