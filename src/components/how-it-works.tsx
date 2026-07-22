"use client";

import { useReveal } from "@/hooks/use-reveal";

const steps = [
  {
    heading: "Set up your office",
    body: "Add your team, enter your licences, and select your state. The right compliance framework loads automatically. Most offices are fully configured in under 15 minutes.",
  },
  {
    heading: "Import existing records",
    body: "Upload current CPD records, trust account schedules, and policy documents. RealComply flags what's current, what's expiring, and what needs immediate attention.",
  },
  {
    heading: "Stay compliant, automatically",
    body: "Deadlines are tracked, reminders are sent, and your audit pack is built in the background. Your team stays focused on clients — not compliance paperwork.",
  },
];

export default function HowItWorks() {
  const headerRef = useReveal(0.1);
  const stepsRef = useReveal(0.05);

  return (
    <section id="product" style={{ background: "var(--rc-surface)", padding: "120px 24px", borderTop: "1px solid var(--rc-border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div ref={headerRef as React.RefObject<HTMLDivElement>} className="reveal" style={{ marginBottom: "80px" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "20px" }}>
            Up and running<br />in an afternoon.
          </h2>
          <p style={{ fontSize: "17px", color: "var(--rc-muted)", lineHeight: 1.7, maxWidth: "500px" }}>
            No implementation consultant. No six-week onboarding. Built to be self-service for busy real estate offices.
          </p>
        </div>

        <div ref={stepsRef as React.RefObject<HTMLDivElement>} className="reveal hiw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--rc-border)", border: "1px solid var(--rc-border)", borderRadius: "16px", overflow: "hidden" }}>
          {steps.map(({ heading, body }, i) => (
            <div
              key={heading}
              style={{
                background: "var(--rc-bg)",
                padding: "40px 36px",
                position: "relative",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--rc-primary)", textTransform: "uppercase", marginBottom: "20px" }}>
                Step {i + 1}
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--rc-ink)", marginBottom: "14px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {heading}
              </h3>
              <p style={{ fontSize: "15px", color: "var(--rc-muted)", lineHeight: 1.75, maxWidth: "none" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hiw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
