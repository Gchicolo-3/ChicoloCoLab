import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-barlow" });
const barlowSemi = Barlow_Semi_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-barlow-semi" });

export const metadata: Metadata = {
  title: "Chicolo CoLab Intake",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowSemi.variable}`}>
      <body>{children}</body>
    </html>
  );
}
