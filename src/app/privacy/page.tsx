import Nav from "@/components/nav";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — RealComply",
  description: "How RealComply collects, uses, and protects your personal information.",
};

const sections = [
  {
    heading: "1. Overview",
    body: `RealComply Pty Ltd ("RealComply", "we", "us", or "our") is committed to protecting the privacy of our customers and their team members. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our compliance platform and website (together, the "Service").\n\nThis policy is governed by the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). By using the Service you consent to the practices described in this policy.`,
  },
  {
    heading: "2. Information We Collect",
    body: `We collect information you provide directly when you:\n\n• Create an account (name, email address, phone number, ABN)\n• Add team members (name, email, licence class, CPD records)\n• Enter trust account data, property records, or policy documents\n• Contact us for support\n\nWe also collect certain information automatically when you use the Service, including IP address, browser type, device identifiers, pages visited, and actions taken within the platform. This is used solely for security, performance monitoring, and product improvement.`,
  },
  {
    heading: "3. How We Use Your Information",
    body: `We use the information we collect to:\n\n• Provide, operate, and maintain the Service\n• Send compliance deadline reminders and alerts to authorised users\n• Generate audit exports and compliance reports on your behalf\n• Respond to support requests and technical enquiries\n• Improve the platform and develop new features\n• Comply with our own legal obligations\n\nWe do not sell, rent, or trade your personal information to third parties for marketing purposes.`,
  },
  {
    heading: "4. Data Storage and Security",
    body: `All data is stored in Australia using Supabase infrastructure hosted on AWS ap-southeast-2 (Sydney). Data is encrypted at rest (AES-256) and in transit (TLS 1.3).\n\nAccess to your organisation's data is restricted to team members you authorise. RealComply staff access is logged and limited to support and security purposes. We conduct regular security reviews and maintain appropriate technical and organisational measures to protect your data.`,
  },
  {
    heading: "5. Disclosure of Information",
    body: `We may share your information only in the following circumstances:\n\n• With service providers who assist us in operating the platform (Supabase, Vercel, Stripe) under strict data processing agreements\n• When required by law, court order, or a government authority with lawful jurisdiction\n• To protect the rights, property, or safety of RealComply, our customers, or others\n• In connection with a merger, acquisition, or sale of assets, with advance notice to affected customers\n\nWe do not share compliance records, staff data, or property information with any third party for commercial purposes.`,
  },
  {
    heading: "6. Your Rights",
    body: `Under the Australian Privacy Principles you have the right to:\n\n• Access the personal information we hold about you\n• Request correction of inaccurate or incomplete information\n• Request deletion of your personal information (subject to legal retention obligations)\n• Opt out of non-essential communications\n• Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)\n\nTo exercise any of these rights, contact us at privacy@realcomply.com.au.`,
  },
  {
    heading: "7. Data Retention",
    body: `We retain your data for as long as your subscription is active. If you cancel, your data is retained for 90 days to allow export, then permanently deleted. Certain records may be retained longer where required by law (e.g. financial records under the Corporations Act 2001).`,
  },
  {
    heading: "8. Cookies",
    body: `We use essential session cookies required to authenticate users and maintain security. For details on all cookies used, see our Cookie Policy.`,
  },
  {
    heading: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email and by posting the updated policy with a revised effective date. Continued use of the Service after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    heading: "10. Contact",
    body: `If you have questions about this Privacy Policy or our data practices, please contact:\n\nRealComply Pty Ltd\nprivacy@realcomply.com.au\nSydney, NSW, Australia`,
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Nav />
      <LegalPage
        title="Privacy Policy"
        effective="1 July 2025"
        sections={sections}
      />
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
      {/* Header */}
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

      {/* Body */}
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
