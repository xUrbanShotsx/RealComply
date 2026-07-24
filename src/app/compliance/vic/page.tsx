import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Victorian Real Estate Compliance Software — RealComply",
  description: "Compliance management for Victorian real estate agencies. Track CPD under Consumer Affairs Victoria requirements, manage trust accounts, and maintain audit-ready records under the Estate Agents Act 1980.",
  keywords: "victoria real estate compliance software, consumer affairs victoria real estate, estate agents act 1980 compliance software, VIC real estate CPD tracking, victoria real estate agency compliance management, real estate compliance melbourne",
  alternates: { canonical: "https://realcomply.com.au/compliance/vic" },
  openGraph: { title: "Victorian Real Estate Compliance Software — RealComply", description: "CPD tracking, trust accounting, and audit-ready records for Victorian real estate agencies under the Estate Agents Act 1980.", url: "https://realcomply.com.au/compliance/vic" },
};

const faqs = [
  { q: "What legislation governs Victoria real estate agency compliance?", a: "The primary legislation is the Estate Agents Act 1980 (VIC) and associated regulations, along with the Residential Tenancies Act 1997 for property management. Consumer Affairs Victoria (CAV) is the primary regulator responsible for licensing, trust accounts, and conduct standards for real estate agents." },
  { q: "What are the CPD requirements for Victorian real estate agents?", a: "Victoria has a triennial (3-year) licence renewal cycle. Agents must complete mandatory continuing professional development (CPD) throughout the licence period. The specific hours and requirements are set by Consumer Affairs Victoria and vary depending on the licence type and registration category." },
  { q: "How are Victorian real estate trust accounts audited?", a: "Victorian real estate agencies holding trust funds must have their trust accounts audited annually by a qualified auditor. The auditor's report must be lodged with Consumer Affairs Victoria within 3 months of the end of the financial year." },
  { q: "What records must a Victorian estate agent principal maintain?", a: "Victorian estate agent principals must maintain trust account ledgers and monthly reconciliations, CPD records for all licensed staff, agency agreements, property management documentation, complaints records, and written policies and procedures covering key compliance areas." },
  { q: "Can RealComply help Victorian agencies with Consumer Affairs Victoria audits?", a: "Yes. RealComply maintains structured records across CPD, licences, trust accounting, and compliance registers. If Consumer Affairs Victoria requests an inspection, your documentation is already organised and ready to present — eliminating the last-minute scramble." },
];

export default function VICCompliancePage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Victorian Real Estate Compliance</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>Compliance software built for Victorian real estate agencies</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>Purpose-built for the Estate Agents Act 1980. CPD tracking, trust account compliance records, and audit-ready documentation under Consumer Affairs Victoria requirements.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>Compliance for Victorian real estate — what RealComply covers</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>Victorian real estate compliance spans the Estate Agents Act 1980, trust accounting regulations, and property management requirements under the Residential Tenancies Act 1997. Principals carry personal liability for compliance failures across their entire agency.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "CPD tracking (Consumer Affairs VIC)", body: "Track CPD completion per licence holder across Victoria's triennial renewal cycle. Flag agents approaching renewal dates before compliance becomes a problem." },
              { title: "Trust account compliance", body: "Log reconciliations, store monthly reports, and upload your annual audit report — structured for the Estate Agents Act annual auditing requirements." },
              { title: "Licence & registration tracking", body: "Store licence numbers, expiry dates, registration categories, and renewal status for every person in your office. Always know who's licensed." },
              { title: "Statutory registers", body: "Complaints, gift, incident, and risk registers — structured and searchable, always available for Consumer Affairs Victoria inspection." },
              { title: "Policies & procedures library", body: "Maintain current policies with review dates and legislative update alerts. Includes templates for privacy, complaints, trust accounting, and more." },
              { title: "Sales & property management checklists", body: "Per-property compliance checklists covering agency agreements, disclosure requirements, identification, and documentation for both sales and management." },
            ].map(({ title, body }) => (
              <div key={title} style={{ padding: "24px", border: "1px solid var(--s-hairline)", borderRadius: "12px", background: "#fff" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{ padding: "0 24px 80px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "28px" }}>Victorian real estate compliance — frequently asked questions</h2>
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
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Built for Victoria. Ready for CAV.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>14-day free trial. No lock-in contract. Purpose-built for Estate Agents Act compliance.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
