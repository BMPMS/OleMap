"use client";
import React, { useState, useRef, TouchEvent } from "react";

// temp function for testing
export const generateNumberSvgs = (count: number) => {
    const svgs = [];

    for (let i = 1; i <= count; i++) {
        svgs.push(
            <svg
                key={i}
                width="300"
                height="300"
                style={{
                    backgroundColor: "#000000",
                    borderRadius: "0.5rem",
                    borderColor: "#A0A0A0",
                    borderWidth: "0.5px",
                }}
            >
                <text
                    x="150"
                    y="158"
                    fontSize="40"
                    fill="white"
                    fontFamily="Arial, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    {i}
                </text>
            </svg>
        );
    }

    return svgs;
};

type InfoBoxCarouselProps = {
    items: React.ReactNode[];
    size: number;
};

export default function InfoBoxCarousel({ items, size }: InfoBoxCarouselProps) {
    const [index, setIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const total = items.length;

    const next = () => {
        if (index < total - 1) setIndex((i) => i + 1);
    };
    const prev = () => {
        if (index > 0) setIndex((i) => i - 1);
    };

    const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        touchStartX.current = e.changedTouches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
        touchEndX.current = e.changedTouches[0].clientX;
        handleSwipe();
    };

    const handleSwipe = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;

        const deltaX = touchStartX.current - touchEndX.current;
        if (Math.abs(deltaX) > 40) {
            if (deltaX > 0) next();
            else prev();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    return (
        <div
            className="infoCarousel fixed inset-x-0 bottom-10 z-[999] flex justify-center pointer-events-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ opacity: 0 }} // initially hidden; can toggle dynamically later
        >
            <div
                className="relative flex items-center justify-center"
                style={{ width: size, height: size }}
            >
                {/* Left arrow */}
                <button
                    className={`absolute left-[-2rem] top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition pointer-events-auto ${
                        index === 0 ? "invisible" : ""
                    }`}
                    onClick={prev}
                    aria-label="Previous"
                >
                    <span className="text-white text-3xl select-none">‹</span>
                </button>

                {/* Right arrow */}
                <button
                    className={`absolute right-[-2rem] top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition pointer-events-auto ${
                        index === total - 1 ? "invisible" : ""
                    }`}
                    onClick={next}
                    aria-label="Next"
                >
                    <span className="text-white text-3xl select-none">›</span>
                </button>

                {/* Upcoming panels to the right */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-start pl-[calc(100%+10px)] space-x-4">
                    {items.slice(index + 1, index + 3).map((item, i) => (
                        <div
                            key={i}
                            className="opacity-30 scale-90"
                            style={{ width: size, height: size }}
                        >
                            {item}
                        </div>
                    ))}
                </div>

                {/* Current SVG */}
                <div className="pointer-events-auto w-full h-full flex items-center justify-center">
                    {items[index]}
                </div>
            </div>
        </div>
    );
}
