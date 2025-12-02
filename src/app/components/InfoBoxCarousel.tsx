"use client";
import React, { useState,} from "react";
import {InfoPanelData} from "@/app/components/D3Carousel";
import {CATEGORY_COLORS, CATEGORY_NAMES} from "@/app/components/ScrollerMapChart";
import D3Carousel from "@/app/components/D3Carousel";
import * as d3 from 'd3';

type InfoBoxCarouselProps = {
    expanded: boolean;
    handleBackToScroll: () => void;
    panelData: InfoPanelData[];
    size: number;
    selectedCategories: Set<number>;
    setExpanded: (newValue: boolean) => void;
    setSelectedCategories: (newList: Set<number>) => void;
    selectedDot: number;
    setSelectedDotId: (newId: number) => void;
};

export default function InfoBoxCarousel({
    expanded,
    handleBackToScroll,
    panelData,
    selectedDot,
    selectedCategories,
    setExpanded,
    setSelectedCategories,
    setSelectedDotId,
    size }: InfoBoxCarouselProps) {

    const basePath = process.env.NODE_ENV === 'production' ? '/OleMap' : '';
    const [currentPanelData, setCurrentPanelData] = useState<InfoPanelData[]>(panelData)
    const [filterExpanded, setFilterExpanded] = useState(false);

    const handleToggle = () => {
        if(!expanded && selectedDot === -1){
            setSelectedDotId(panelData[0].id)
        }
        setExpanded(!expanded);
        setFilterExpanded(false);
    }

    const handleFilterToggle = () => {
        if(!filterExpanded && !expanded){
            setExpanded(true)
        }
        setFilterExpanded(prev => !prev);
    }

    const toggleCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        const newSet = new Set(selectedCategories);

        if(newSet.has(+value) && newSet.size > 1){
            newSet.delete(+value)
        } else {
            newSet.add(+value);
        }
        setSelectedCategories(newSet);
        const filteredPanelData = panelData.filter((f) => newSet.has(f.category));
        setCurrentPanelData(filteredPanelData);
        if(selectedDot !== -1 && !filteredPanelData.find((f) => f.id === selectedDot)){
            setSelectedDotId(filteredPanelData[0].id);
        }

        d3.selectAll('input.toggleInput[type="checkbox"]').each((d,i,objects) => {
             const currentInput = objects[i] as HTMLInputElement;
             d3.select(currentInput)
                 .property("checked", newSet.has(+currentInput.value))
        })

    }

    const allFilterItems = Object.entries(CATEGORY_COLORS).reduce((acc, entry) => {
        acc.push({
            label: CATEGORY_NAMES[+entry[0] as keyof typeof CATEGORY_NAMES],
            key: +entry[0],
            color: entry[1]
        })
        return acc;
    },[] as {key: number, label: string, color: string}[])

    const filterListOneKeys =   [7, 10,2];
    const filterListTwoKeys = [5,4,1,3];

    const filterList1 = filterListOneKeys.map((m) => allFilterItems.find((f) => f.key === m))
        .filter((f) => f !== undefined);
    const filterList2 = filterListTwoKeys.map((m) => allFilterItems.find((f) => f.key === m))
        .filter((f) => f !== undefined);
    const FilterList = ( items:  {key: number,label: string, color: string}[] ) => {
        return (
            <div className="flex flex-col">
                {items.map((item, index) => (
                    <label key={index} className="cursor-pointer flex items-center mb-1.5">
                        <input
                            type="checkbox"
                            defaultChecked={selectedCategories.has(item.key)}
                            value={item.key}
                            className="toggleInput mr-2 w-4 h-4 rounded appearance-none border border-white bg-black checked:bg-white"
                            onChange={toggleCategory}
                        />
                        <span
                            className="px-1 py-[1px]"
                            style={{ fontSize: "20px", backgroundColor: item.color, color: "white", opacity: selectedCategories.has(item.key) ? 1 : 0.4 }}
                        >
            {item.label}
          </span>
                    </label>
                ))}
            </div>
        );
    };

    const closeInfoBox = () => {
        setExpanded(false);
    }

    const triggerBackToScroll = () => {
        setExpanded(false);
        handleBackToScroll()
    }


    return (
        <>
            {/* --- BACKGROUND GRADIENT --- */}
            <div
                className="noselect infoBackground bg-gradient-to-b from-black/0 to-black  transition-transform duration-500 ease-in-out fixed bottom-[355px] w-full h-[100px] z-800"
                onClick={closeInfoBox}
                style={{
                    opacity: expanded ? 1 : 0,
                    transform: expanded || filterExpanded? "translateY(0px)" : "translateY(350px)",
                }}
            />
            {/* --- Carousel --- */}
            <div
                className="infoCarousel bg-black bottom-0 h-[355px] fixed inset-x-0  z-[999] flex justify-center "
                 style={{
                    opacity: 0,
                    transform: expanded || filterExpanded ? "translateY(0px)" : "translateY(350px)",
                }}
            >
                <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.95 }}>
                    {/* --- FLOATING BUTTONS --- */}
                    <div className="noselect absolute -top-14 right-0 flex space-x-3 pointer-events-auto md:right-[-50%] md:translate-x-1/2">
                        <img
                            src={`${basePath}/images/backToScroll.svg`}
                            width={40}
                            height={40}
                            className="noselect bg-transparent cursor-pointer transition-transform duration-200 hover:scale-110 hover:brightness-125"
                            alt="icon"
                            onClick={triggerBackToScroll}
                        />
                        <img
                            src={`${basePath}/images/filterBox.svg`}
                            width={40}
                            height={40}
                            className="noselect bg-transparent cursor-pointer transition-transform duration-200 hover:scale-110 hover:brightness-125"
                            alt="icon"
                            onClick={handleFilterToggle}
                        />
                        <img
                            src={`${basePath}/images/${expanded ? "expand" : "collapse"}.svg`}
                            width={40}
                            height={40}
                            className="noselect bg-transparent cursor-pointer transition-transform duration-200 hover:scale-110 hover:brightness-125"
                            alt="icon"
                            onClick={handleToggle}
                        />
                    </div>

                    {/* --- MAIN CONTENT SWITCH --- */}
                    <div className="w-full h-full flex items-center justify-center">
                        {filterExpanded ? (
                            <div className="filterMenu w-full mt-[-80px] h-full flex justify-center overflow-x-visible">
                                <div
                                    className="w-[350px] sm:w-[697px] h-full flex-shrink-0 p-4 bg-gradient-to-b from-black/0 to-black"
                                >
                                    {/* Header with icon and text on same line */}
                                    <p className="flex items-center font-bold text-[24px] leading-[26px] m-0">
                                        <img
                                            src={`${basePath}/images/filterBoxMenu.svg`}
                                            width={40}
                                            height={40}
                                            className="noselect ml-[-10px] mr-2"
                                            alt="icon"
                                        />
                                        Filteroptionen
                                    </p>

                                    {/* Responsive container for the two filter lists */}
                                    <div className="flex flex-col sm:flex-row sm:gap-4">
                                        {/* Left / top */}
                                        <div className="flex-1">
                                            <p className="font-bold text-[20px] leading-[24px] mt-1 mb-2">Hauptkategorien</p>
                                            {FilterList(filterList1)}
                                        </div>

                                        {/* Right / bottom */}
                                        <div className="flex-1 mt-1 sm:mt-0">
                                            <p className="font-bold text-[20px] leading-[24px] mt-2 mb-2">Weitere Konfliktfelder</p>
                                            {FilterList(filterList2)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        ) : (
                            <div className="carouselContent fixed bottom-0 left-0  w-full h-[355px]">
                                <D3Carousel panelWidthHeight={355} panelData={currentPanelData} selectedDotId={selectedDot} setSelectedDotId={setSelectedDotId}/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
