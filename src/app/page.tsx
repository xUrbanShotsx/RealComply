import Nav from "@/components/nav";
import Hero from "@/components/hero";
import TrustBar from "@/components/trust-bar";
import Features from "@/components/features";
import StatsSection from "@/components/stats-section";
import HowItWorks from "@/components/how-it-works";
import Testimonials from "@/components/testimonials";
import Pricing from "@/components/pricing";
import CtaSection from "@/components/cta-section";
import Footer from "@/components/footer";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RealComply",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Compliance platform for Australian real estate agencies. CPD tracking, trust accounting, AML due diligence, audit readiness, and policy management.",
    url: "https://realcomply.com.au",
    offers: [
      { "@type": "Offer", price: "129", priceCurrency: "AUD", name: "Essentials" },
      { "@type": "Offer", price: "249", priceCurrency: "AUD", name: "Standard" },
      { "@type": "Offer", price: "549", priceCurrency: "AUD", name: "Professional" },
    ],
    publisher: {
      "@type": "Organization",
      name: "RealComply Pty Ltd",
      url: "https://realcomply.com.au",
      areaServed: "AU",
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Australian Real Estate Agencies",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <StatsSection />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
