"use client";
import '@fortawesome/fontawesome-free/css/all.min.css';
import {scrollData} from "@/app/data/scrollData";
import HelpScroller from "@/app/components/HelpScroller";

export default  function Home() {

  return (
        <HelpScroller  helpScrollData={scrollData}></HelpScroller>



  );
}
