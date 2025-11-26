import type { Metadata } from "next";
import { Bebas_Neue} from "next/font/google";
import "./globals.css";
import React from "react";
import localFont from 'next/font/local';

const bebasNeue = localFont({
    src: [
        { path: './fonts/BebasNeuePro-Regular.ttf', weight: '400' },
        { path: './fonts/BebasNeuePro-Bold.ttf', weight: '700' }
    ],
    variable: "--font-bebas",
})

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
