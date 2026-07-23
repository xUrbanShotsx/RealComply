import Nav from "@/components/nav";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement — RealComply",
  description: "How RealComply processes your organisation's data and the protections in place.",
};

const sections = [
  {
    heading: "1. Purpose",
    body: `This Data Processing Agreement ("DPA") forms part of the agreement between RealComply Pty Ltd ("Processor") and the subscribing organisation ("Controller"). It governs how RealComply processes personal information on your behalf when you use the Service.\n\nThis DPA is consistent with the Privacy Act 1988 (Cth), the Australian Privacy Principles (APPs), and where applicable, the General Data Protection Regulation (GDPR) for customers whose team members are located in the European Economic Area.`,
  },
  {
    heading: "2. Roles",
    body: `Your organisation is the Controller of all personal data you upload to or generate within the RealComply platform, including staff records, property records, and client information.\n\nRealComply acts as a Processor — we process your data only on your documented instructions and for the purpose of providing the Service. We do not determine the purposes or means of processing; you do.`,
  },
  {
    heading: "3. Categories of Data Processed",
    body: `In the course of providing the Service, we may process the following categories of personal information on your behalf:\n\n• Staff identifiers: names, email addresses, phone numbers, licence numbers, and CPD records\n• Property information: addresses, vendor and buyer names associated with listed properties\n• Trust account data: account names, balances, and transaction records you enter\n• Compliance records: policy acknowledgements, audit trail entries, and timestamps\n\nWe do not process sensitive information (as defined in the Privacy Act) unless you explicitly upload it, in which case the same protections apply.`,
  },
  {
    heading: "4. Sub-processors",
    body: `RealComply uses the following sub-processors to deliver the Service. Each is bound by data processing agreements with equivalent protections:\n\n• Supabase Inc — database hosting and authentication (AWS ap-southeast-2, Sydney)\n• Vercel Inc — application hosting and edge delivery\n• Stripe Inc — payment processing (card data is processed directly by Stripe and never stored by RealComply)\n• Resend Inc — transactional email delivery (compliance reminders and alerts)\n\nWe will notify you of any material changes to this sub-processor list with at least 14 days' notice.`,
  },
  {
    heading: "5. Data Location",
    body: `All primary data storage occurs within Australia (AWS ap-southeast-2, Sydney region). Vercel's edge network may cache non-personal application assets in other regions; no personal data is stored outside Australia without your explicit consent.\n\nIf you require specific data residency commitments beyond the above, contact us to discuss enterprise arrangements.`,
  },
  {
    heading: "6. Security Measures",
    body: `We implement the following technical and organisational security measures:\n\n• Encryption at rest: AES-256 for all stored data\n• Encryption in transit: TLS 1.3 for all data in motion\n• Access controls: role-based access within your organisation; RealComply staff access is logged and requires explicit authorisation\n• Row-level security: database policies ensure users can only access their own organisation's data\n• Penetration testing: conducted annually by an independent security firm\n• Incident response: documented procedures with 72-hour notification for breaches affecting personal data`,
  },
  {
    heading: "7. Data Retention and Deletion",
    body: `Personal data is retained for the duration of your active subscription. Upon termination:\n\n• Your data remains accessible for 90 days to allow export\n• After 90 days, all personal data is permanently deleted from production systems\n• Backup copies are purged within 30 days of the primary deletion\n\nYou may request early deletion at any time by contacting privacy@realcomply.com.au. We will confirm completion within 10 business days.`,
  },
  {
    heading: "8. Data Subject Requests",
    body: `If an individual (e.g. a staff member) submits an access, correction, or deletion request relating to data you control, you are responsible for fulfilling that request as Controller. We will assist you upon written request and at no additional charge. We will respond to your requests within 5 business days.`,
  },
  {
    heading: "9. Audits",
    body: `You may request a written summary of our security practices once per calendar year at no charge. More frequent or in-person audits may be arranged by mutual agreement and may incur reasonable costs.`,
  },
  {
    heading: "10. Contact",
    body: `Data protection enquiries:\n\nRealComply Pty Ltd\nprivacy@realcomply.com.au\nSydney, NSW, Australia`,
  },
];

export default function DataProcessing() {
  return (
    <>
      <Nav />
      <LegalPage title="Data Processing Agreement" effective="1 July 2025" sections={sections} />
      <Footer />
    </>
  );
}

function LegalPage({
  title,
  effective,
  sections,
}: {
  title: string;
  effective: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <main style={{ paddingTop: "72px", background: "#ffffff", minHeight: "100vh" }}>
      <div style={{ background: "#f6f9fc", borderBottom: "1px solid var(--s-hairline)", padding: "64px 24px 48px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <p style={{ fontSize: "13px", color: "var(--s-ink-mute)", marginBottom: "12px", maxWidth: "none" }}>Legal</p>
          <h1
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 300,
              color: "var(--s-ink)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--s-ink-mute)", maxWidth: "none" }}>
            Effective date: {effective}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 24px 96px" }}>
        {sections.map(({ heading, body }) => (
          <div key={heading} style={{ marginBottom: "48px" }}>
            <h2
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--s-ink)",
                marginBottom: "14px",
                letterSpacing: "-0.01em",
              }}
            >
              {heading}
            </h2>
            <div style={{ fontSize: "15px", color: "var(--s-ink-secondary)", lineHeight: 1.85 }}>
              {body.split("\n").map((line, i) =>
                line === "" ? (
                  <br key={i} />
                ) : (
                  <p key={i} style={{ marginBottom: "8px", maxWidth: "none" }}>
                    {line}
                  </p>
                )
              )}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: "64px",
            padding: "20px 24px",
            background: "#f6f9fc",
            borderRadius: "10px",
            fontSize: "13px",
            color: "var(--s-ink-mute)",
          }}
        >
          This document does not constitute legal advice. For specific legal guidance, consult a qualified Australian solicitor.
        </div>
      </div>
    </main>
  );
}
