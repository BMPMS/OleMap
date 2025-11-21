import type { Metadata } from "next";
import { Bebas_Neue} from "next/font/google";
import "./globals.css";
import React from "react";

const bebasNeue = Bebas_Neue({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "Knicker Map",
  description: "Map Component and Scroller for Ole",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${bebasNeue.variable} antialiased`}
      >
      <div className="w-screen overflow-x-auto">
        {children}
      </div>
      </body>
    </html>
  );
}
