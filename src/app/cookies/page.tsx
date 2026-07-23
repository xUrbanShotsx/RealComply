import Nav from "@/components/nav";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — RealComply",
  description: "What cookies RealComply uses and how to control them.",
};

const sections = [
  {
    heading: "1. What Are Cookies",
    body: `Cookies are small text files stored on your device when you visit a website. They allow the site to remember information about your visit, such as your login session, preferences, and actions taken.\n\nRealComply uses cookies sparingly and only where necessary to operate the platform securely.`,
  },
  {
    heading: "2. Cookies We Use",
    body: `We use two categories of cookies:\n\nEssential cookies — required for the platform to function. These include session authentication tokens issued by Supabase that keep you logged in during your session. Without these cookies the Service cannot operate. No consent is required for essential cookies under Australian law.\n\nPreference cookies — we store certain UI preferences (such as your dashboard layout) in browser local storage, not cookies. These are never transmitted to third parties.\n\nWe do not use advertising cookies, cross-site tracking cookies, or social media pixels.`,
  },
  {
    heading: "3. Third-Party Cookies",
    body: `RealComply does not load third-party advertising or analytics scripts that set cookies. The only third-party cookies that may be present are:\n\n• Stripe — if you visit our pricing page and interact with a Stripe-hosted checkout element, Stripe may set its own fraud-prevention cookies. These are governed by Stripe's own Privacy Policy.\n\nWe do not use Google Analytics, Facebook Pixel, or similar tracking services.`,
  },
  {
    heading: "4. How to Control Cookies",
    body: `Essential cookies cannot be disabled without preventing the Service from working. If you wish to clear them, you can do so through your browser settings:\n\n• Chrome: Settings → Privacy and Security → Clear browsing data → Cookies\n• Safari: Settings → Privacy → Manage Website Data\n• Firefox: Settings → Privacy & Security → Cookies and Site Data → Clear Data\n• Edge: Settings → Privacy, search, and services → Clear browsing data\n\nClearing cookies will log you out of the platform. You can log back in at any time.`,
  },
  {
    heading: "5. Do Not Track",
    body: `RealComply respects Do Not Track (DNT) signals. We do not track users across third-party websites and do not change our data collection practices based on whether DNT is enabled — we collect minimal data in all cases.`,
  },
  {
    heading: "6. Changes to This Policy",
    body: `If we introduce new cookies we will update this policy and notify subscribers by email before the change takes effect.`,
  },
  {
    heading: "7. Contact",
    body: `Questions about our use of cookies:\n\nRealComply Pty Ltd\nprivacy@realcomply.com.au\nSydney, NSW, Australia`,
  },
];

export default function CookiePolicy() {
  return (
    <>
      <Nav />
      <LegalPage title="Cookie Policy" effective="1 July 2025" sections={sections} />
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
