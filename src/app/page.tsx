"use client";
import '@fortawesome/fontawesome-free/css/all.min.css';
import ScrollerMapChart from "@/app/components/ScrollerMapChart";
import mapData from "@/app/data/mapData.json";
import geoJson from "@/app/data/countriesNoAntarctica.json"
export default  function Home() {

  return (
      <>
          <div className="d3ChartContainer w-full h-full">
              <ScrollerMapChart
                  containerClass={"d3Chart"}
                  geoJson={geoJson}
                  mapData={mapData}
              />
          </div>
      </>
  );
}
