import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Real Estate Compliance Software Australia — RealComply",
  description: "The compliance management platform built specifically for Australian real estate agencies. CPD tracking, trust accounting, audit readiness, policy management, and statutory registers — all in one place.",
  keywords: "real estate compliance software australia, real estate agency compliance management, real estate compliance platform, CPD tracking software real estate, trust accounting compliance software, real estate audit software australia, property management compliance software",
  alternates: { canonical: "https://realcomply.com.au/real-estate-compliance-software" },
  openGraph: { title: "Real Estate Compliance Software Australia — RealComply", description: "The compliance management platform built specifically for Australian real estate agencies. CPD, trust accounting, audit readiness, and more.", url: "https://realcomply.com.au/real-estate-compliance-software" },
};

const faqs = [
  { q: "What is real estate compliance software?", a: "Real estate compliance software is a platform that helps agencies manage their regulatory obligations in one place — including CPD tracking, trust account records, audit readiness, staff licences, statutory registers, and policy management. It replaces spreadsheets, shared drives, and paper-based systems with a structured, always-accessible compliance record." },
  { q: "How is RealComply different from real estate CRM or property management software?", a: "RealComply is purpose-built for compliance management, not sales, listings, or property management operations. It sits alongside platforms like PropertyMe, REST, or Console to manage the regulatory obligations those platforms don't cover — CPD, trust account audit records, compliance registers, licence tracking, and policy management." },
  { q: "Which states does RealComply support?", a: "RealComply supports real estate agencies across all Australian states and territories, including NSW (Property and Stock Agents Act 2002), VIC (Estate Agents Act 1980), QLD (Property Occupations Act 2014), WA (Real Estate and Business Agents Act 1978), SA (Land Agents Act 1994), and others. Each state's compliance requirements are reflected in the platform's modules." },
  { q: "How many team members can use RealComply?", a: "RealComply offers three plans: Small (up to 10 team members, $99/month), Medium (up to 40 team members, $189/month), and Large (up to 100 team members, $349/month). All plans include the full feature set — the only difference is team size and storage capacity." },
  { q: "Does RealComply replace a compliance officer?", a: "RealComply does not replace the judgement of a qualified compliance professional. It provides the infrastructure to track, document, and maintain compliance records so that whoever is responsible for compliance — whether a dedicated officer, the principal, or an external consultant — has everything organised and accessible." },
  { q: "Is there a free trial?", a: "Yes. RealComply offers a 14-day free trial with no credit card required. You can set up your agency, onboard staff, and explore the full platform before committing to a paid plan. No lock-in contracts apply after the trial." },
];

export default function RealEstateComplianceSoftwarePage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Real Estate Compliance Software</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>The compliance platform built for Australian real estate agencies</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "620px" }}>RealComply replaces spreadsheets, shared drives, and paper-based systems with a single platform for CPD tracking, trust accounting records, audit readiness, staff licences, and statutory registers — all organised and always accessible.</p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
              <Link href="/pricing" style={{ display: "inline-block", padding: "13px 28px", background: "transparent", color: "var(--s-ink)", borderRadius: "9999px", fontWeight: 500, fontSize: "15px", textDecoration: "none", border: "1px solid var(--s-hairline)" }}>View pricing</Link>
            </div>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>Everything your agency needs to stay compliant</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>Australian real estate principals are personally responsible for compliance across their entire organisation. A single gap in CPD records, a missing trust account reconciliation, or an out-of-date policy library can result in fines, improvement notices, or licence suspension. RealComply tracks every obligation so you don't have to manage it manually.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "CPD & licence tracking", body: "Track required and completed CPD hours per agent, licence expiry dates, and renewal deadlines across your entire team — updated in real time.", link: "/features/cpd-tracking" },
              { title: "Trust accounting records", body: "Log reconciliations, store monthly reports, and upload annual audit reports. A complete, auditable trust accounting record structured for your state.", link: "/features/trust-accounting" },
              { title: "Audit readiness", body: "A live compliance dashboard shows your agency's health across all modules. Know where your gaps are before the regulator does.", link: "/features/audit-readiness" },
              { title: "Policy & procedures library", body: "Build your policy library from templates, track review dates, and receive legislative update alerts when changes affect your policies.", link: "/features/policy-management" },
              { title: "Statutory registers", body: "Complaints, gift, incident, and risk registers — structured, searchable, and ready for any regulator inspection." },
              { title: "Staff onboarding & notifications", body: "Onboard staff with their licence details and email. Staff linked to a RealComply account receive in-app notifications about CPD deadlines and reminders." },
            ].map(({ title, body, link }) => (
              <div key={title} style={{ padding: "24px", border: "1px solid var(--s-hairline)", borderRadius: "12px", background: "#fff" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--s-ink)", marginBottom: "8px" }}>{title}</p>
                <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", lineHeight: 1.65, margin: 0 }}>{body}</p>
                {link && <Link href={link} style={{ display: "inline-block", marginTop: "10px", fontSize: "13px", color: "var(--s-primary)", textDecoration: "none", fontWeight: 500 }}>Learn more →</Link>}
              </div>
            ))}
          </div>
        </section>
        <section style={{ padding: "0 24px 72px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "16px" }}>Compliance software for real estate in every state</h2>
          <p style={{ fontSize: "15px", color: "var(--s-ink-mute)", marginBottom: "24px", lineHeight: 1.7 }}>Each Australian state has its own real estate legislation and regulator. RealComply supports agencies across all states.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {[
              { label: "NSW — Property and Stock Agents Act 2002", href: "/compliance/nsw" },
              { label: "VIC — Estate Agents Act 1980", href: "/compliance/vic" },
              { label: "QLD — Property Occupations Act 2014", href: "/compliance/qld" },
              { label: "WA — Real Estate and Business Agents Act 1978", href: "/compliance/wa" },
              { label: "SA — Land Agents Act 1994", href: "/compliance/sa" },
            ].map(({ label, href }) => (
              <Link key={href} href={href} style={{ display: "inline-block", padding: "8px 16px", border: "1px solid var(--s-hairline)", borderRadius: "9999px", fontSize: "13px", color: "var(--s-ink)", textDecoration: "none", background: "#fff" }}>{label}</Link>
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
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>Real estate compliance, finally under control.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>14-day free trial. No lock-in contract. Built for Australian real estate agencies.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
