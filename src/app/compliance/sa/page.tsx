import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "South Australia Real Estate Compliance Software — RealComply",
  description: "Compliance management for South Australian real estate agencies. Track CPD under Consumer and Business Services requirements, manage trust accounts, and maintain audit-ready records under the Land Agents Act 1994.",
  keywords: "south australia real estate compliance software, CBS SA real estate compliance, land agents act 1994 compliance software, SA real estate CPD tracking, south australia real estate agency compliance management, real estate compliance adelaide",
  alternates: { canonical: "https://realcomply.com.au/compliance/sa" },
  openGraph: { title: "South Australia Real Estate Compliance Software — RealComply", description: "CPD tracking, trust accounting, and audit-ready records for SA real estate agencies under the Land Agents Act 1994.", url: "https://realcomply.com.au/compliance/sa" },
};

const faqs = [
  { q: "What legislation governs South Australia real estate compliance?", a: "South Australian real estate agencies operate primarily under the Land Agents Act 1994 and associated regulations. Consumer and Business Services (CBS) is the primary regulator, responsible for licensing, trust accounting oversight, and compliance with conduct standards. Property management obligations are also governed by the Residential Tenancies Act 1995." },
  { q: "What are the CPD requirements for South Australian real estate agents?", a: "South Australian registered land agents and sales representatives are required to complete Continuing Professional Development (CPD) as a condition of triennial registration renewal. Consumer and Business Services sets the CPD requirements, which include both mandatory and elective components aligned to current regulatory priorities." },
  { q: "How are South Australian real estate trust accounts audited?", a: "SA real estate agents who hold trust money must have their trust accounts audited annually by a registered company auditor. The audit report must be submitted to Consumer and Business Services within the required timeframe. Trust accounting failures are among the most serious compliance breaches under the Land Agents Act." },
  { q: "What records must a SA land agent principal maintain?", a: "SA land agent principals must maintain trust account ledgers and monthly reconciliation records, CPD records for all registered staff, vendor and landlord management agreements, sale contracts and property management documentation, complaints handling records, and policies and procedures across key compliance areas." },
  { q: "Can RealComply support SA agencies through CBS inspections?", a: "Yes. RealComply maintains structured records across CPD, licences, trust accounting, compliance registers, and policies. Consumer and Business Services inspections — whether announced or unannounced — are easier to navigate when your documentation is already organised and accessible." },
];

export default function SACompliancePage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>South Australia Real Estate Compliance</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>Compliance software built for South Australian real estate agencies</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>Purpose-built for the Land Agents Act 1994. CPD tracking, trust account compliance records, and audit-ready documentation under Consumer and Business Services requirements.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>Compliance for South Australian real estate — what RealComply covers</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>The Land Agents Act 1994 imposes significant obligations on SA land agent principals. Non-compliance with trust accounting, CPD requirements, or agreement documentation can result in regulatory action by Consumer and Business Services, including fines and licence suspension.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "CPD tracking (CBS triennial renewal)", body: "Track CPD completion per registered agent across the triennial renewal cycle. Identify agents with outstanding CPD obligations before renewal deadlines arrive." },
              { title: "Trust account compliance", body: "Log reconciliations, store monthly reports, and upload your annual audit report — structured for Land Agents Act requirements." },
              { title: "Licence & registration tracking", body: "Store registration numbers, expiry dates, and renewal deadlines for every person in your office." },
              { title: "Agreement & contract records", body: "Track management agreements and vendor agreements to ensure every property listing and tenancy has compliant appointment documentation." },
              { title: "Statutory registers", body: "Complaints, gift, incident, and risk registers — structured, searchable, and always available for CBS inspection." },
              { title: "Policies & procedures library", body: "Maintain current agency policies with review schedules and legislative update alerts for key compliance areas." },
            ].map(({ title, body }) => (
              <div key={title} style={{ padding: "24px", border: "1px solid var(--s-hairline)", borderRadius: "12px", background: "#fff" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{ padding: "0 24px 80px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "28px" }}>South Australia real estate compliance — frequently asked questions</h2>
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
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Built for South Australia. Ready for CBS.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>14-day free trial. No lock-in contract. Purpose-built for Land Agents Act compliance.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
