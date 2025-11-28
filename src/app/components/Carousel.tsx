import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import InfoPanelChart, { InfoPanelData } from "@/app/components/InfoPanelChart";

// Function to generate the SVGs from panelData
const generateSvgs = (panelData: InfoPanelData[], size: number, currentIndex: number) => {
    return panelData.map((item, i) => (
        <InfoPanelChart
            key={i}
            widthHeight={size}
            panelData={item}
            index={i}
            total={panelData.length}
            inFocus={i === currentIndex ? "middle" : "outgoing"}
        />
    ));
};

interface CarouselProps {
    panelData: InfoPanelData[];
    size: number;
}

const Carousel: React.FC<CarouselProps> = ({ panelData, size }) => {
    const [svgs, setSvgs] = useState<React.JSX.Element[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        slidesToScroll: 1,
    });

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCurrentIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    useEffect(() => {
        const allSvgs = generateSvgs(panelData, size, currentIndex);
        setSvgs(allSvgs);
    }, [panelData, size, currentIndex]);

    return (
        <div className="carousel-container">
            <div className="embla" ref={emblaRef}>
                <div className="embla__container" style={{ display: 'flex' }}>
                    {svgs.map((svg, i) => (
                        <div
                            key={i}
                            className="embla__slide"
                            style={{
                                flex: '0 0 auto',
                                minWidth: size,
                                marginRight: '20px',
                            }}
                        >
                            <div
                                className="panel-wrapper"
                                style={{
                                    width: size,
                                    height: size,
                                }}
                            >
                                {svg}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Carousel;
