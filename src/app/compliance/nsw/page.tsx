import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NSW Real Estate Compliance Software — RealComply",
  description: "Compliance management platform for NSW real estate agencies. Track CPD under NSW Fair Trading requirements, manage trust accounts, maintain audit-ready records under the Property and Stock Agents Act 2002.",
  keywords: "NSW real estate compliance software, NSW Fair Trading compliance, property stock agents act 2002 software, NSW real estate CPD tracking, NSW real estate audit software, NSW real estate agency compliance management",
  alternates: { canonical: "https://realcomply.com.au/compliance/nsw" },
  openGraph: { title: "NSW Real Estate Compliance Software — RealComply", description: "Built for NSW real estate agencies. CPD tracking, trust accounting, audit readiness under the Property and Stock Agents Act 2002.", url: "https://realcomply.com.au/compliance/nsw" },
};

const faqs = [
  { q: "What legislation governs NSW real estate agency compliance?", a: "The primary legislation is the Property and Stock Agents Act 2002 (NSW) and the Property and Stock Agents Regulation 2022 (NSW). These cover licence requirements, CPD obligations, trust accounting rules, agency agreements, and conduct standards. NSW Fair Trading is the primary regulator." },
  { q: "How many CPD hours do NSW real estate agents need each year?", a: "NSW real estate agents and certificate holders must complete 12 hours of CPD per year — 9 hours of compulsory CPD aligned to NSW Fair Trading's current priorities, and at least 3 hours of elective CPD. This is tracked per individual licence holder." },
  { q: "How often are NSW real estate trust accounts audited?", a: "NSW real estate trust accounts must be audited annually by an approved auditor. The audit must be lodged with NSW Fair Trading within 3 months of the end of the financial year. Failure to lodge can result in licence suspension." },
  { q: "What records must a NSW real estate agency principal maintain?", a: "NSW real estate principals are responsible for maintaining trust account ledgers and reconciliation records, CPD records for all staff, agency agreements for each property, AML/CTF procedures (if applicable), a complaints register, and documented policies and procedures." },
  { q: "Can RealComply help prepare for a NSW Fair Trading audit?", a: "Yes. RealComply maintains structured compliance records across CPD, licences, trust accounting, policies, and statutory registers. If NSW Fair Trading requests an inspection — announced or unannounced — your records are already organised and accessible." },
];

export default function NSWCompliancePage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>NSW Real Estate Compliance</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>Compliance software built for NSW real estate agencies</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>Purpose-built for the Property and Stock Agents Act 2002. Track CPD, manage trust accounting compliance, and maintain audit-ready records under NSW Fair Trading requirements.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>Compliance for NSW real estate — what RealComply covers</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>NSW has some of Australia's most detailed real estate compliance requirements. Under the Property and Stock Agents Act 2002, principals bear personal responsibility for ensuring their agency operates within the law — including CPD compliance, trust accounting, and conduct standards for every person in the office.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "CPD tracking (NSW Fair Trading)", body: "12 hours per year, per licence holder. Track required and completed hours, set deadlines, and flag overdue staff before NSW Fair Trading does." },
              { title: "Trust account compliance", body: "Log reconciliations, store monthly reports, and upload your annual audit report — structured for the annual auditing requirements under the Act." },
              { title: "Sales & management checklists", body: "Per-property compliance checklists covering agency agreements, identification, AML checks, and contract documentation for sales and management." },
              { title: "Statutory registers", body: "Complaints, gift, incident, and risk registers — structured, searchable, and always available for inspection by NSW Fair Trading." },
              { title: "Policies & procedures library", body: "Maintain current policies with review dates and legislative update alerts. Start from compliance-aligned templates or upload your own." },
              { title: "Staff onboarding & licence tracking", body: "Track licence numbers, expiry dates, and onboarding status for every person in your office. Know who's licensed and who isn't." },
            ].map(({ title, body }) => (
              <div key={title} style={{ padding: "24px", border: "1px solid var(--s-hairline)", borderRadius: "12px", background: "#fff" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>
        <section style={{ padding: "0 24px 80px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "28px" }}>NSW real estate compliance — frequently asked questions</h2>
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
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Built for NSW. Ready for audit.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>14-day free trial. No lock-in contract. Purpose-built for Property and Stock Agents Act compliance.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
