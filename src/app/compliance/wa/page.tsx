import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Western Australia Real Estate Compliance Software — RealComply",
  description: "Compliance management for WA real estate agencies. Track CPD under REIWA and Department of Mines requirements, manage trust accounts, and maintain audit-ready records under the Real Estate and Business Agents Act 1978.",
  keywords: "western australia real estate compliance software, REBA Act 1978 compliance, WA real estate CPD tracking, real estate compliance perth, western australia real estate agency compliance, department mines industry regulation WA real estate",
  alternates: { canonical: "https://realcomply.com.au/compliance/wa" },
  openGraph: { title: "Western Australia Real Estate Compliance Software — RealComply", description: "CPD tracking, trust accounting, and audit-ready records for WA real estate agencies under the Real Estate and Business Agents Act 1978.", url: "https://realcomply.com.au/compliance/wa" },
};

const faqs = [
  { q: "What legislation governs Western Australia real estate compliance?", a: "Western Australian real estate agencies operate under the Real Estate and Business Agents Act 1978 (REBA Act) and associated regulations. The Department of Mines, Industry Regulation and Safety (DMIRS) through the Consumer Protection division is the primary regulator, responsible for licensing, trust accounts, and conduct standards." },
  { q: "What are the CPD requirements for WA real estate agents?", a: "Western Australian real estate agents must complete Continuing Professional Development (CPD) as a condition of triennial licence renewal. DMIRS sets the minimum CPD requirements, which include mandatory topics. Agents must retain CPD records and present them as part of the triennial renewal process." },
  { q: "How are Western Australian real estate trust accounts audited?", a: "WA real estate agents who hold trust money must have their trust accounts audited annually by a registered company auditor. The audit must be lodged with DMIRS within 3 months of the end of the financial year. Deficiencies in trust accounting are treated very seriously and can result in licence suspension or cancellation." },
  { q: "What records must a WA real estate principal maintain?", a: "WA real estate principals must maintain trust account ledgers and reconciliation records, CPD records for all licensed agents, property management agreements, sales contracts and agency agreements, complaints handling records, and written policies and procedures for the key areas of their business." },
  { q: "Can RealComply support WA agencies through a DMIRS audit or inspection?", a: "Yes. RealComply maintains organised records across CPD, licences, trust accounting, compliance registers, and policies. If DMIRS Consumer Protection requests an inspection or audit, all your documentation is already structured and accessible within the platform." },
];

export default function WACompliancePage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Western Australia Real Estate Compliance</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>Compliance software built for Western Australian real estate agencies</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>Purpose-built for the Real Estate and Business Agents Act 1978. CPD tracking, trust account compliance records, and audit-ready documentation under DMIRS Consumer Protection requirements.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>Compliance for Western Australian real estate — what RealComply covers</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>The Real Estate and Business Agents Act 1978 imposes strict obligations on WA licence holders. Trust accounting non-compliance, missing CPD records, and inadequate policies are among the most common issues identified during DMIRS inspections.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "CPD tracking (DMIRS triennial renewal)", body: "Track CPD completion per licence holder across the triennial renewal cycle. Flag agents with outstanding CPD before their renewal date." },
              { title: "Trust account compliance", body: "Log reconciliations, store monthly reports, and upload your annual audit report — structured for REBA Act requirements." },
              { title: "Licence & registration tracking", body: "Store licence numbers, expiry dates, and renewal deadlines. Know who's licensed at all times." },
              { title: "Property agreement records", body: "Track property management agreements and sales agency agreements to ensure every property has compliant appointment documentation." },
              { title: "Statutory registers", body: "Complaints, gift, incident, and risk registers — structured and searchable, always available for DMIRS inspection." },
              { title: "Policies & procedures library", body: "Maintain current agency policies with review schedules and legislative update alerts." },
            ].map(({ title, body }) => (
              <div key={title} style={{ padding: "24px", border: "1px solid var(--s-hairline)", borderRadius: "12px", background: "#fff" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{ padding: "0 24px 80px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "28px" }}>Western Australia real estate compliance — frequently asked questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {faqs.map(({ q, a }) => (
              <div key={q} style={{ borderBottom: "1px solid var(--s-hairline)", paddingBottom: "20px" }}>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{q}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.7, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{ background: "#1c1e54", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "520px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Built for WA. Ready for DMIRS.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>14-day free trial. No lock-in contract. Purpose-built for REBA Act compliance.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
