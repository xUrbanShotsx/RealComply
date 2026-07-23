"use client";

import { useReveal } from "@/hooks/use-reveal";

const steps = [
  {
    n: 1,
    heading: "Set up your office",
    body: "Add your team, enter your licences, and select your state. The right compliance framework loads automatically. Most offices are fully configured in under 15 minutes.",
  },
  {
    n: 2,
    heading: "Import existing records",
    body: "Upload current CPD records, trust account schedules, and policy documents. RealComply flags what's current, what's expiring, and what needs immediate attention.",
  },
  {
    n: 3,
    heading: "Stay compliant, automatically",
    body: "Deadlines are tracked, reminders are sent, and your audit pack is built in the background. Your team stays focused on clients — not compliance paperwork.",
  },
];

export default function HowItWorks() {
  const headerRef = useReveal(0.1);
  const stepsRef = useReveal(0.05);

  return (
    <section
      id="product"
      style={{ background: "#f6f9fc", padding: "120px 24px" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ textAlign: "center", marginBottom: "80px" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 300,
              color: "var(--s-ink)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: "20px",
            }}
          >
            Up and running
            <br />
            in an afternoon.
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "var(--s-ink-mute)",
              lineHeight: 1.7,
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            No implementation consultant. No six-week onboarding. Built to be self-service for busy
            real estate offices.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={stepsRef as React.RefObject<HTMLDivElement>}
          className="reveal hiw-steps"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "48px", position: "relative" }}
        >
          {/* Connecting line */}
          <div
            aria-hidden
            className="hiw-line"
            style={{
              position: "absolute",
              top: "20px",
              left: "calc(100% / 6)",
              right: "calc(100% / 6)",
              height: "1px",
              background:
                "linear-gradient(to right, transparent 0%, var(--s-hairline) 15%, var(--s-hairline) 85%, transparent 100%)",
              zIndex: 0,
            }}
          />

          {steps.map(({ n, heading, body }) => (
            <div key={n} style={{ position: "relative", zIndex: 1 }}>
              {/* Step circle — Stripe pill style */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1.5px solid var(--s-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--s-primary)",
                  marginBottom: "24px",
                  boxShadow: "var(--s-shadow-card)",
                }}
              >
                {n}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  color: "var(--s-ink)",
                  marginBottom: "12px",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.2,
                }}
              >
                {heading}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--s-ink-mute)",
                  lineHeight: 1.75,
                  maxWidth: "none",
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hiw-steps { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hiw-line { display: none; }
        }
      `}</style>
    </section>
  );
}
