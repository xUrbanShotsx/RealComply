import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CPD Tracking Software for Real Estate Agents — RealComply",
  description: "Automatically track CPD hours, licence renewal dates, and compliance deadlines for every agent in your office. Built for Australian real estate agencies under NSW Fair Trading requirements.",
  keywords: "CPD tracking software real estate, CPD tracking NSW real estate agents, continuing professional development real estate australia, real estate licence renewal tracking, NSW Fair Trading CPD requirements software",
  alternates: { canonical: "https://realcomply.com.au/features/cpd-tracking" },
  openGraph: {
    title: "CPD Tracking Software for Real Estate Agents — RealComply",
    description: "Track CPD hours and licence renewals for every agent in your office. Built for Australian real estate compliance.",
    url: "https://realcomply.com.au/features/cpd-tracking",
  },
};

const faqs = [
  { q: "How many CPD hours do NSW real estate agents need?", a: "NSW real estate agents and certificate holders must complete 12 hours of CPD per year under the Property and Stock Agents Act 2002. At least 3 of those hours must be elective CPD and 9 must be compulsory CPD aligned to current regulatory priorities set by NSW Fair Trading." },
  { q: "What happens if a staff member's CPD is overdue?", a: "RealComply marks the staff member as overdue and flags them in your Licence Tracking dashboard. If the staff member has a linked RealComply account, they receive an in-app notification prompting them to update their records." },
  { q: "Can each staff member update their own CPD records?", a: "Yes. When a staff member is onboarded with their work email, they can log into RealComply to view their own CPD status and licence expiry. Principals and super users see the full team overview." },
  { q: "Does RealComply integrate with the REINSW or other CPD providers?", a: "RealComply is a record-keeping and tracking tool — you log CPD activities and upload supporting certificates. It does not directly integrate with training providers, but it stores all your evidence in one place, ready for audit." },
  { q: "Is CPD tracking available for Victorian and Queensland real estate agents?", a: "Yes. While CPD requirements vary by state, RealComply allows you to set custom required hours and deadlines per staff member, making it suitable for agencies in VIC, QLD, WA, SA, and ACT as well as NSW." },
];

export default function CPDTrackingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        {/* Hero */}
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>CPD Tracking</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>
              CPD tracking software built for Australian real estate agencies
            </h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>
              Track every agent's CPD hours, licence expiry dates, and renewal status from a single dashboard. Know who's compliant before NSW Fair Trading asks.
            </p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              Start free 14-day trial →
            </Link>
          </div>
        </section>

        {/* What it does */}
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>What RealComply's CPD tracking covers</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>
            The Property and Stock Agents Act 2002 requires NSW real estate agents and certificate holders to complete 12 hours of CPD per year. Managing this manually across a team of 10, 20, or 60 agents creates significant risk — a single missed renewal can result in an agent operating without a valid licence.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "Per-agent CPD dashboard", body: "See required hours, completed hours, and percentage progress for every staff member at a glance. Colour-coded status: complete, due soon, or overdue." },
              { title: "Licence expiry tracking", body: "Enter each agent's licence number and expiry date. RealComply flags renewals due within 60 days so you're never caught out at audit." },
              { title: "In-app notifications", body: "When a staff member is onboarded with their email, they receive notifications about their own CPD status and upcoming renewal deadlines." },
              { title: "Audit-ready records", body: "All CPD data is stored per agency and scoped to your organisation only. Export or screenshot your CPD register to present to an auditor in minutes." },
            ].map(({ title, body }) => (
              <div key={title} style={{ padding: "24px", border: "1px solid var(--s-hairline)", borderRadius: "12px", background: "#fff" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: "0 24px 80px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "28px" }}>Frequently asked questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {faqs.map(({ q, a }) => (
              <div key={q} style={{ borderBottom: "1px solid var(--s-hairline)", paddingBottom: "20px" }}>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{q}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.7, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "#1c1e54", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "520px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Know your team's CPD status — always.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>No more spreadsheets. No more chasing agents for their CPD certificates two days before an audit.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              Start free 14-day trial →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
