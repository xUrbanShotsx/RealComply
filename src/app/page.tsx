import Nav from "@/components/nav";
import Hero from "@/components/hero";
import TrustBar from "@/components/trust-bar";
import Features from "@/components/features";
import HowItWorks from "@/components/how-it-works";
import Pricing from "@/components/pricing";
import CtaSection from "@/components/cta-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Pricing />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
