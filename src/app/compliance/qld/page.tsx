import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Queensland Real Estate Compliance Software — RealComply",
  description: "Compliance management for Queensland real estate agencies. Track CPD under Office of Fair Trading requirements, manage trust accounts, and maintain audit-ready records under the Property Occupations Act 2014.",
  keywords: "queensland real estate compliance software, office of fair trading QLD real estate, property occupations act 2014 compliance, QLD real estate CPD tracking, queensland real estate agency compliance, real estate compliance brisbane",
  alternates: { canonical: "https://realcomply.com.au/compliance/qld" },
  openGraph: { title: "Queensland Real Estate Compliance Software — RealComply", description: "CPD tracking, trust accounting, and audit-ready records for Queensland real estate agencies under the Property Occupations Act 2014.", url: "https://realcomply.com.au/compliance/qld" },
};

const faqs = [
  { q: "What legislation governs Queensland real estate agency compliance?", a: "Queensland real estate agencies operate under the Property Occupations Act 2014 (POA) and the Property Occupations Regulation 2014. The Office of Fair Trading (OFT) within the Queensland Department of Justice and Attorney-General is the primary regulator, responsible for licensing, trust accounts, and conduct standards." },
  { q: "What are the CPD requirements for Queensland real estate agents?", a: "Queensland real estate agents must complete Continuing Professional Development (CPD) as part of their annual licence renewal. The Office of Fair Trading sets CPD requirements each year, specifying mandatory and elective topics. Individual licence holders are responsible for completing and recording their CPD by the renewal date." },
  { q: "How are Queensland real estate trust accounts audited?", a: "Queensland real estate agents holding trust money must have their trust accounts audited annually. The audit must be conducted by a registered company auditor and the report submitted to the Office of Fair Trading. Non-compliance with trust accounting obligations is a serious offence under the Property Occupations Act." },
  { q: "What records must a Queensland real estate principal licensee maintain?", a: "Queensland principal licensees must maintain trust account records and reconciliations, CPD records for all licence holders, signed appointment documents for each property, disclosure statements, complaints handling records, and written agency policies and procedures." },
  { q: "Can RealComply help Queensland agencies prepare for OFT audits?", a: "Yes. RealComply maintains structured records across CPD, licences, trust accounting, registers, and policies. Whether the Office of Fair Trading conducts an announced or unannounced compliance visit, your documentation is already organised and accessible within the platform." },
];

export default function QLDCompliancePage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Queensland Real Estate Compliance</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>Compliance software built for Queensland real estate agencies</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>Purpose-built for the Property Occupations Act 2014. CPD tracking, trust account compliance records, and audit-ready documentation under Office of Fair Trading requirements.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>Compliance for Queensland real estate — what RealComply covers</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>Queensland's Property Occupations Act 2014 imposes detailed obligations on principals and licence holders. Non-compliance — whether with trust accounting, CPD, or appointment documents — can result in fines, licence suspension, or cancellation by the Office of Fair Trading.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "CPD tracking (QLD Office of Fair Trading)", body: "Annual CPD per licence holder. Track mandatory and elective topics, completion status, and renewal dates across your entire team." },
              { title: "Trust account compliance", body: "Record reconciliations, store monthly reports, and upload your annual auditor's report — structured for Property Occupations Act requirements." },
              { title: "Licence & registration tracking", body: "Store licence numbers, expiry dates, and registration categories. Flag renewals before they lapse." },
              { title: "Appointment document records", body: "Track property appointments and disclosure statements to ensure every property under management or listed for sale has compliant documentation." },
              { title: "Statutory registers", body: "Complaints, gift, incident, and risk registers — structured, searchable, and always available for OFT inspection." },
              { title: "Policies & procedures library", body: "Maintain current agency policies with review dates and legislative update alerts. Start from templates or upload your own." },
            ].map(({ title, body }) => (
              <div key={title} style={{ padding: "24px", border: "1px solid var(--s-hairline)", borderRadius: "12px", background: "#fff" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{ padding: "0 24px 80px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "28px" }}>Queensland real estate compliance — frequently asked questions</h2>
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
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Built for Queensland. Ready for OFT.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>14-day free trial. No lock-in contract. Purpose-built for Property Occupations Act compliance.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
