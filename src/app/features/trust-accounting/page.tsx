import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust Accounting Compliance Software for Real Estate — RealComply",
  description: "Track trust account reconciliations, log transactions, store monthly reports, and maintain audit-ready records. Built for Australian real estate agencies under state trust accounting legislation.",
  keywords: "trust accounting compliance software, trust account reconciliation software real estate, real estate trust accounting australia, property stock agents act trust accounts, trust accounting audit real estate NSW",
  alternates: { canonical: "https://realcomply.com.au/features/trust-accounting" },
  openGraph: {
    title: "Trust Accounting Compliance Software for Real Estate — RealComply",
    description: "Manage trust account reconciliations, transaction logs, and monthly reports. Audit-ready records for Australian real estate agencies.",
    url: "https://realcomply.com.au/features/trust-accounting",
  },
};

const faqs = [
  { q: "What trust accounting records must NSW real estate agencies keep?", a: "Under the Property and Stock Agents Act 2002 and the Property and Stock Agents Regulation 2022, NSW real estate agencies must maintain a trust account ledger, record every receipt and disbursement, reconcile accounts at least monthly, and have accounts audited annually by an approved auditor." },
  { q: "How does RealComply help with trust account reconciliation?", a: "RealComply's Account Reconciliation module lets you record trust accounts, log credits and debits, and store monthly reconciliation reports with supporting files. It provides a clear audit trail of every transaction and reconciliation period." },
  { q: "Can I store my annual trust audit report in RealComply?", a: "Yes. The Audit Reports section under Trust Accounting lets you upload your annual audit report PDF, record the financial year, auditor name, and any notes. All uploads are stored securely and linked to your organisation." },
  { q: "Is RealComply a trust accounting software like Console or PropertyMe?", a: "No. RealComply is a compliance management and record-keeping platform — not a trust accounting ledger system. It is designed to sit alongside your existing property management software, storing the compliance evidence and documentation that auditors require." },
  { q: "Which states require annual trust account audits for real estate agencies?", a: "All Australian states and territories require real estate trust accounts to be audited annually by an approved auditor. The specific legislation varies: NSW (Property and Stock Agents Act 2002), VIC (Estate Agents Act 1980), QLD (Property Occupations Act 2014), WA (Real Estate and Business Agents Act 1978)." },
];

export default function TrustAccountingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Trust Accounting</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>Trust accounting compliance records for Australian real estate agencies</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>Log reconciliations, track transactions, store monthly reports, and upload your annual audit report — all in one place, always ready for inspection.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>What RealComply's trust accounting module covers</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>Trust accounting is one of the highest-risk areas of real estate compliance. Deficiencies discovered during an annual audit can result in licence suspension or cancellation. RealComply gives your agency a structured, auditable record of every trust accounting compliance activity.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "Account reconciliation records", body: "Record each trust account, log your monthly reconciliation status, and attach supporting documentation. Build a complete reconciliation history over time." },
              { title: "Transaction log", body: "Log credits and debits against individual trust accounts with descriptions, dates, and amounts. Filter by account to review activity at any time." },
              { title: "Monthly trust reports", body: "Upload monthly reconciliation reports for each account and period. Store the PDF alongside notes about variances or exceptions for each month." },
              { title: "Annual audit report storage", body: "Upload your annual trust audit report, record the auditor's name and financial year, and store it permanently in your compliance records." },
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
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Trust account compliance shouldn't be stressful.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>Centralise your records. Walk into your next audit prepared.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
