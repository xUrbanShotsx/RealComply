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
  title: "RealComply — Compliance Software for Australian Real Estate Agencies",
  description:
    "The compliance platform purpose-built for Australian real estate. CPD tracking, trust accounting compliance, AML due diligence, audit readiness, and policy management — one platform, zero surprises at audit.",
  keywords:
    "real estate compliance software australia, CPD tracking NSW, trust accounting compliance software, AUSTRAC AML real estate, NSW Fair Trading compliance, real estate audit software australia, property stock agents act compliance",
  authors: [{ name: "RealComply" }],
  openGraph: {
    title: "RealComply — Compliance Software for Australian Real Estate",
    description:
      "CPD tracking, trust accounting, AML compliance, audit readiness — built for Australian real estate offices.",
    url: "https://realcomply.com.au",
    siteName: "RealComply",
    type: "website",
    locale: "en_AU",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RealComply — Australian Real Estate Compliance Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RealComply — Compliance Software for Australian Real Estate",
    description:
      "CPD tracking, trust accounting, AML, audit readiness — built for Australian real estate offices.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/RealComplyicon.png", apple: "/RealComplyicon.png" },
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
