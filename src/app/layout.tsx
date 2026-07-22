import type { Metadata } from "next";
import { Inter, Arimo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Real Comply — Compliance Software for Australian Real Estate",
  description:
    "The compliance platform built for Australian real estate businesses. CPD tracking, audit readiness, trust accounting compliance, AML, policies and procedures — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${arimo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
