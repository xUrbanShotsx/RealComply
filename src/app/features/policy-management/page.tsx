import type { Metadata } from "next";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Policy & Procedures Management Software for Real Estate — RealComply",
  description: "Build and maintain a compliant policies and procedures library for your real estate agency. Review schedules, legislative update alerts, and audit-ready documentation in one platform.",
  keywords: "real estate policy management software, policies procedures real estate agency, NSW real estate agency policies, real estate compliance policies australia, property management policy software",
  alternates: { canonical: "https://realcomply.com.au/features/policy-management" },
  openGraph: { title: "Policy & Procedures Management for Real Estate — RealComply", description: "Maintain a compliant policy library with review schedules and legislative update alerts.", url: "https://realcomply.com.au/features/policy-management" },
};

const faqs = [
  { q: "What policies must a real estate agency have in place?", a: "Australian real estate agencies are generally required to have documented policies covering privacy and data handling, trust account management, complaints handling, AML/CTF procedures (where applicable), workplace health and safety, and CPD and licence management. Specific requirements vary by state regulator." },
  { q: "How often should real estate agency policies be reviewed?", a: "Best practice is to review core compliance policies annually, or whenever relevant legislation changes. RealComply tracks the next review date for each policy and flags those that are overdue, so nothing slips through between annual reviews." },
  { q: "Does RealComply provide policy templates?", a: "Yes. RealComply includes a library of policy templates covering the key areas of real estate compliance — privacy, complaints, trust accounting, CPD, workplace conduct, and more. Templates are starting points only and should be reviewed by a qualified professional before adoption." },
  { q: "Can I upload my own policies to RealComply?", a: "Yes. In addition to using the built-in template library, you can upload your own policy documents in any format. Each uploaded policy is tracked in your library with review dates, status, and category." },
  { q: "What happens when legislation changes affecting my policies?", a: "RealComply sends legislative update alerts to notify you when relevant changes occur that may require a policy review. You can then update the relevant policies and reset the review date, keeping your library current." },
];

export default function PolicyManagementPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <section style={{ background: "#f6f9fc", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--s-primary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Policy Management</p>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "20px" }}>Policies and procedures management for real estate agencies</h1>
            <p style={{ fontSize: "18px", color: "var(--s-ink-mute)", lineHeight: 1.7, marginBottom: "36px", maxWidth: "600px" }}>Build your agency's policy library from templates, track review dates, receive legislative update alerts, and keep every document audit-ready — without the paper.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "var(--s-primary)", color: "white", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
        <section style={{ padding: "72px 24px", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 300, color: "var(--s-ink)", letterSpacing: "-0.03em", marginBottom: "20px" }}>Everything in your policy library, tracked and current</h2>
          <p style={{ fontSize: "16px", color: "var(--s-ink-mute)", lineHeight: 1.75, marginBottom: "32px" }}>Auditors expect real estate agencies to maintain documented, current policies across a range of compliance areas. Outdated or missing policies are a common finding that can result in improvement notices or further scrutiny. RealComply makes it easy to build, maintain, and demonstrate a compliant policy library.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { title: "Policy template library", body: "Start from professionally structured templates covering privacy, complaints, trust accounting, CPD, AML, WHS, and more. Customise for your agency." },
              { title: "Review schedule tracking", body: "Set a review date for every policy. RealComply flags policies that are due or overdue for review so your library never goes stale." },
              { title: "Document upload", body: "Upload your existing policies in any format. Store, categorise, and track them alongside template-based policies in one unified library." },
              { title: "Legislative update alerts", body: "Receive alerts when relevant legislative or regulatory changes occur that may require you to update your policies and procedures." },
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
            <h2 style={{ fontSize: "1.75rem", fontWeight: 300, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>A policy library that keeps itself current.</h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "28px" }}>No more folders of outdated Word documents. Your compliance library, always up to date.</p>
            <Link href="/signup" style={{ display: "inline-block", padding: "13px 28px", background: "white", color: "#1c1e54", borderRadius: "9999px", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>Start free 14-day trial →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
