"use client";
import React, {useState, useRef, TouchEvent, MouseEvent} from "react";
import InfoPanelChart, { InfoPanelData } from "@/app/components/InfoPanelChart";
import {CATEGORY_COLORS, CATEGORY_NAMES} from "@/app/components/ScrollerMapChart";


type InfoBoxCarouselProps = {
    expanded: boolean;
    setExpanded: (newValue: boolean) => void;
    panelData: InfoPanelData[];
    size: number;
    selectedCategories: Set<number>;
    setSelectedCategories: (newList: Set<number>) => void;
    index: number;
    setIndex: (newIndex: number) => void;
    setSelectedDotId: (newId: number) => void;
};

export default function InfoBoxCarousel({
    expanded,
    index,
    panelData,
    selectedCategories,
    setExpanded,
    setIndex,
    setSelectedCategories,
    setSelectedDotId,
    size }: InfoBoxCarouselProps) {

    const basePath = process.env.NODE_ENV === 'production' ? '/OleMap' : '';
    // const [currentPanelData, setCurrentPanelData] = useState<InfoPanelData[]>(panelData)
    const [filterExpanded, setFilterExpanded] = useState(false);

    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const total = panelData.length;

    const resetIndex = (newIndex: number) => {

        setIndex(newIndex);
        setSelectedDotId(panelData[newIndex].id)
    }
    const next = () => {
        if(index < total - 1){
            resetIndex( index + 1)
        };
    }
    const prev = () => {
        if(index > 0){
            resetIndex( index - 1);
        }
    }

    const handleToggle = () => {
        setExpanded(!expanded);
        setSelectedDotId(expanded ? -1 : panelData[index].id)
        setFilterExpanded(false);
    }

    const handleFilterToggle = () => {
        setFilterExpanded(prev => !prev);
    }

    const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.changedTouches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        touchEndX.current = e.changedTouches[0].clientX;
        handleSwipe();
    };

    const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        touchStartX.current = e.clientX;
    };

    const onMouseUp = (e: MouseEvent<HTMLDivElement>) => {
        touchEndX.current = e.clientX;
        handleSwipe();
    };

    const handleSwipe = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;

        const deltaX = touchStartX.current - touchEndX.current;

        if (Math.abs(deltaX) > 40) {
            if(deltaX > 0) {
                next();
            } else {
                prev();
            }
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    const toggleCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        const newSet = new Set(selectedCategories);

        if(newSet.has(+value)){
            newSet.delete(+value)
        } else {
            newSet.add(+value);
        }
        setSelectedCategories(newSet);
    }

    const allFilterItems = Object.entries(CATEGORY_COLORS).reduce((acc, entry) => {
        acc.push({
            label: CATEGORY_NAMES[+entry[0] as keyof typeof CATEGORY_NAMES],
            key: +entry[0],
            color: entry[1]
        })
        return acc;
    },[] as {key: number, label: string, color: string}[])

    const filterList1 = allFilterItems.filter((f,i) => i < 3);
    const filterList2 = allFilterItems.filter((f,i) => i >= 3);
    const FilterList = ( items:  {key: number,label: string, color: string}[] ) => {
        return (
            <div className="flex flex-col">
                {items.map((item, index) => (
                    <p key={index} className="flex items-center mb-1.5">
                        <input
                            type="checkbox"
                            defaultChecked={selectedCategories.has(item.key)}
                            value={item.key}
                            className="mr-2 w-4 h-4 bg-black checked:bg-black accent-white"
                            onChange={toggleCategory }
                        />
                        <span
                            className="px-1 py-[1px]"
                            style={{ backgroundColor: item.color, color: "white", opacity: selectedCategories.has(item.key) ? 1 : 0.4 }}
                        >
            {item.label}
          </span>
                    </p>
                ))}
            </div>
        );
    };

    const closeInfoBox = () => {
        setExpanded(false);
        setSelectedDotId(-1)
    }

    return (
        <>
            {/* --- BACKGROUND GRADIENT --- */}
            <div
                className="noselect infoCarouselBackground transition-transform duration-500 ease-in-out fixed bottom-0 w-full h-[450px] bg-gradient-to-b from-[rgba(0,0,0,0)] to-black  z-800"
                onClick={closeInfoBox}
                style={{
                    opacity: expanded ? 1 : 0,
                    transform: expanded || filterExpanded? "translateY(0px)" : "translateY(350px)",
                }}
            />
            {/* --- Carousel --- */}
            <div
                className="infoCarousel transition-transform duration-500 ease-in-out fixed inset-x-0 bottom-5 z-[999] flex justify-center  transition-opacity duration-500"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                style={{
                    opacity: expanded ? 1 : 0,
                    transform: expanded || filterExpanded ? "translateY(0px)" : "translateY(350px)",
                }}
            >
                <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                    {/* --- FLOATING BUTTONS --- */}
                    <div className="noselect absolute -top-14 right-0 flex space-x-3 pointer-events-auto md:right-[-50%] md:translate-x-1/2">
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
                            <div className="filterMenu w-full h-full flex justify-center overflow-x-visible">
                                <div
                                    className="w-[350px] sm:w-[697px] h-full flex-shrink-0 p-4 bg-gradient-to-b from-[rgba(0,0,0,0)] to-black"
                                >
                                    {/* Header with icon and text on same line */}
                                    <p className="flex items-center font-bold text-[24px] leading-[26px] mb-2">
                                        <img
                                            src={`${basePath}/images/filterBoxMenu.svg`}
                                            width={40}
                                            height={40}
                                            className="noselect mr-2"
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
                            <div className="carouselContent relative w-full h-full">
                                {/* --- Outgoing panels (previous items) --- */}
                                <div className="absolute top-6 left-0 w-full h-full pointer-events-none flex items-center justify-end pr-[calc(100%+10px)] space-x-4">
                                    {panelData.slice(0, index).map((item, i) => (
                                        <div
                                            key={i}
                                            className="opacity-30 scale-90"
                                            style={{ width: size, height: size }}
                                        >
                                            <InfoPanelChart
                                                widthHeight={size}
                                                panelData={item}
                                                index={i}
                                                total={total}
                                                inFocus={"outgoing"}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-6 left-0 w-full h-full pointer-events-none items-center justify-start pl-[calc(100%+10px)] space-x-4">
                                    {panelData.slice(index + 1).map((item, i) => (
                                        <div
                                            key={i}
                                            className="opacity-30 scale-90"
                                            style={{
                                                width: size,
                                                height: size,
                                                position: 'absolute',  // Ensure each upcoming panel is absolutely positioned
                                                left: `${(i + 1) * (size + 10)}px`,  // Offset each panel horizontally
                                            }}
                                        >
                                            <InfoPanelChart
                                                widthHeight={size}
                                                panelData={item}
                                                index={index + 1 + i}
                                                total={total}
                                                inFocus={"incoming"}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* --- Current panel --- */}
                                <div className="mainPanel pointer-events-auto w-full h-full flex items-center justify-center">
                                    <InfoPanelChart
                                        widthHeight={size}
                                        panelData={panelData[index]}
                                        index={index}
                                        total={total}
                                        inFocus={"middle"}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
