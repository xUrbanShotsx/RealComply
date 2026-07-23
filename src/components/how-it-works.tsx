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
      style={{ background: "var(--rc-surface)", padding: "120px 24px" }}
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
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "var(--rc-ink)",
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
              color: "var(--rc-muted)",
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
          {/* Connecting line between step numbers */}
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
                "linear-gradient(to right, transparent 0%, oklch(0.80 0.040 295) 15%, oklch(0.80 0.040 295) 85%, transparent 100%)",
              zIndex: 0,
            }}
          />

          {steps.map(({ n, heading, body }) => (
            <div key={n} style={{ position: "relative", zIndex: 1 }}>
              {/* Step number */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "white",
                  border: "2px solid #8c52ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#8c52ff",
                  marginBottom: "24px",
                  fontFamily: "var(--font-display), system-ui, sans-serif",
                }}
              >
                {n}
              </div>

              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--rc-ink)",
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
                  color: "var(--rc-muted)",
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
