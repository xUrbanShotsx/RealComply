import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Audit Readiness Software for Real Estate Agencies — RealComply",
  description: "Know your compliance score before the auditor arrives. RealComply tracks CPD, policies, trust accounts, licences, and registers so your agency is always audit-ready.",
  keywords: "audit readiness software real estate, real estate agency audit preparation, NSW Fair Trading audit compliance, real estate compliance audit checklist, property stock agents act audit software",
  alternates: { canonical: "https://realcomply.com.au/features/audit-readiness" },
  openGraph: { title: "Audit Readiness Software for Real Estate Agencies — RealComply", description: "Know your compliance score before the auditor arrives.", url: "https://realcomply.com.au/features/audit-readiness" },
};

const faqs = [
  { q: "What do NSW Fair Trading auditors look for during a real estate audit?", a: "NSW Fair Trading auditors typically review trust account records and reconciliations, CPD completion for all licence holders, agency agreement compliance for sales and management properties, AML/CTF procedures (for applicable agencies), complaints handling records, and policies and procedures. RealComply maintains records across all of these areas." },
  { q: "How much notice does NSW Fair Trading give before an audit?", a: "NSW Fair Trading can conduct inspections with or without notice. Announced audits may provide a few days' notice; however, unannounced inspections do occur. This is why maintaining ongoing compliance records — rather than preparing at the last minute — is critical." },
  { q: "What is a real estate compliance score?", a: "RealComply's dashboard calculates a compliance score for each module — staff, properties, policies, trust accounting — based on the completeness of your records. It gives principals a real-time view of where their agency's compliance gaps are before an auditor identifies them." },
  { q: "Does RealComply cover both sales and property management compliance?", a: "Yes. RealComply includes separate compliance checklists for residential sales transactions and residential property management, covering items such as CMA reports, agency agreements, identification, AML checks, and contract documentation." },
  { q: "Can I generate a compliance report to show an auditor?", a: "RealComply stores all compliance data in structured records that can be reviewed and exported. You can present your CPD register, policy library, trust account records, and register history directly from the platform." },
];

export default function AuditReadinessPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Audit Readiness</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>Know your compliance score before the auditor does</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>RealComply tracks every compliance obligation across your agency — CPD, licences, trust accounts, policies, registers — and shows you where the gaps are before NSW Fair Trading does.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>What RealComply audits for you — continuously</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>Most real estate agencies only think about compliance when an audit is imminent. By then, gaps in CPD records, missing trust account reconciliations, or outdated policies are already a problem. RealComply tracks compliance continuously so you always know where you stand.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "Live compliance dashboard", body: "A real-time overview of your agency's compliance health across staff, properties, policies, and trust accounting — with scores and action items." },
              { title: "Staff & licence compliance", body: "Track CPD completion, licence expiry, and onboarding status for every team member. See at a glance who needs attention." },
              { title: "Property checklists", body: "Per-property compliance checklists for sales and management ensure every transaction has the required documentation before settlement or audit." },
              { title: "Policy & procedures library", body: "Maintain a current library of agency policies with review dates, overdue alerts, and version tracking." },
              { title: "Statutory registers", body: "Gift, complaints, incident, and risk registers — structured and searchable, ready to present to any auditor or regulator." },
              { title: "Trust accounting records", body: "Transaction logs, reconciliation records, monthly reports, and annual audit reports — all stored and accessible." },
            ].map(({ title, body }) => (
              <div key={title} style={{ padding: "24px", border: "1px solid var(--s-hairline)", borderRadius: "12px", background: "#fff" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>
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
        <section style={{ background: "#1c1e54", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: "520px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Stop preparing for audits. Start being ready for them.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>14-day free trial. No lock-in contract. Cancel any time.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
