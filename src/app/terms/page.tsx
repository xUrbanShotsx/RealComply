import Nav from "@/components/nav";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — RealComply",
  description: "The terms and conditions governing your use of the RealComply platform.",
};

const sections = [
  {
    heading: "1. Acceptance of Terms",
    body: `By accessing or using the RealComply platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you are entering into these Terms on behalf of a business entity, you represent that you have authority to bind that entity.\n\nIf you do not agree to these Terms, do not use the Service.`,
  },
  {
    heading: "2. Description of Service",
    body: `RealComply provides a compliance management platform designed for Australian real estate agencies. The Service includes tools for CPD and licence tracking, trust account compliance checklists, marketing tracking for listed properties, policy management, and audit readiness reporting.\n\nRealComply does not provide legal advice, financial advice, or act as a compliance consultant. The platform is a record-keeping and tracking tool. Responsibility for meeting all legislative obligations remains with the licensee in charge and the agency.`,
  },
  {
    heading: "3. Subscriptions and Payment",
    body: `Access to the Service requires a paid subscription. Subscription fees are billed monthly in advance and are non-refundable except as required by Australian Consumer Law.\n\nFees are charged in Australian dollars (AUD) plus GST where applicable. We may change pricing with 30 days' written notice. Continued use after the notice period constitutes acceptance of the new pricing.\n\nPayment is processed by Stripe. RealComply does not store credit card details.`,
  },
  {
    heading: "4. Permitted Use",
    body: `You may use the Service only for your agency's internal compliance management purposes. You must not:\n\n• Share your account credentials with persons outside your organisation\n• Use the Service to store data unrelated to your compliance obligations\n• Attempt to reverse-engineer, scrape, or extract data from the platform\n• Use the Service in any way that violates applicable Australian law\n• Resell or sublicence access to the Service to third parties`,
  },
  {
    heading: "5. Your Data",
    body: `You retain ownership of all compliance records, staff data, and property information you upload to the Service. By using the Service you grant RealComply a limited licence to store, process, and display your data solely for the purpose of providing the Service to you.\n\nWe do not access your data except to provide technical support when explicitly requested, or for security and fraud prevention purposes.`,
  },
  {
    heading: "6. Limitation of Liability",
    body: `To the maximum extent permitted by law, RealComply's total liability to you for any claim arising from or related to the Service is limited to the fees you paid in the three months preceding the claim.\n\nRealComply is not liable for any indirect, incidental, consequential, or special damages, including loss of profits, loss of data, or regulatory penalties arising from your use of or inability to use the Service.\n\nThe Service is a compliance record-keeping tool. RealComply does not guarantee that use of the platform will result in a successful audit outcome or compliance with any specific legislation.`,
  },
  {
    heading: "7. Availability and Maintenance",
    body: `We aim for 99.5% monthly uptime excluding scheduled maintenance. We will provide reasonable advance notice of planned downtime. We are not liable for downtime caused by third-party infrastructure providers, force majeure events, or circumstances beyond our reasonable control.`,
  },
  {
    heading: "8. Termination",
    body: `Either party may terminate the subscription at any time. If you cancel, access continues until the end of the current billing period. Your data is retained for 90 days following termination and then permanently deleted.\n\nWe may suspend or terminate your access immediately if you breach these Terms, fail to pay, or use the Service in a way that creates legal risk for RealComply or other users.`,
  },
  {
    heading: "9. Governing Law",
    body: `These Terms are governed by the laws of New South Wales, Australia. Any disputes will be subject to the exclusive jurisdiction of the courts of New South Wales.`,
  },
  {
    heading: "10. Changes to Terms",
    body: `We may update these Terms from time to time. We will notify you of material changes by email at least 14 days before they take effect. Continued use of the Service after the effective date constitutes acceptance.`,
  },
  {
    heading: "11. Contact",
    body: `Questions about these Terms:\n\nRealComply Pty Ltd\nlegal@realcomply.com.au\nSydney, NSW, Australia`,
  },
];

export default function TermsOfService() {
  return (
    <>
      <Nav />
      <LegalPage title="Terms of Service" effective="1 July 2025" sections={sections} />
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
