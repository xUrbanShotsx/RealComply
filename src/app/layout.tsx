import type { Metadata } from "next";
import { Inter, Arimo, Barlow } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "REA Hub — CRM & Compliance for Australian Real Estate",
  description:
    "The CRM and compliance platform purpose-built for Australian real estate. Listings, pipeline, prospecting, CPD tracking, trust accounting, AML, and audit readiness — one platform.",
  keywords:
    "real estate compliance software australia, CPD tracking NSW, trust accounting compliance software, AUSTRAC AML real estate, NSW Fair Trading compliance, real estate audit software australia, property stock agents act compliance",
  authors: [{ name: "REA Hub" }],
  openGraph: {
    title: "REA Hub — Compliance Software for Australian Real Estate",
    description:
      "CPD tracking, trust accounting, AML compliance, audit readiness — built for Australian real estate offices.",
    url: "https://realcomply.com.au",
    siteName: "REA Hub",
    type: "website",
    locale: "en_AU",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "REA Hub — Australian Real Estate Compliance Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "REA Hub — Compliance Software for Australian Real Estate",
    description:
      "CPD tracking, trust accounting, AML, audit readiness — built for Australian real estate offices.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  alternates: { canonical: "https://realcomply.com.au" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${arimo.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
