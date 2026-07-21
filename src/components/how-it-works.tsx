"use client";

import { useReveal } from "@/hooks/use-reveal";

const steps = [
  {
    n: "01",
    heading: "Set up your office",
    body: "Add your team, connect your roster, and tell RealComply which state you operate in. The right compliance framework loads automatically. Takes under 15 minutes.",
  },
  {
    n: "02",
    heading: "Import your existing obligations",
    body: "Upload your current CPD records, licence dates, trust account schedules, and policy documents. We'll flag what's current, what's expiring, and what needs attention immediately.",
  },
  {
    n: "03",
    heading: "Stay compliant, automatically",
    body: "RealComply tracks deadlines, sends reminders, flags legislative updates, and builds your audit pack in the background. Your team spends zero time chasing compliance.",
  },
];

export default function HowItWorks() {
  const headerRef = useReveal(0.1);
  const stepsRef = useReveal(0.05);

  return (
    <section
      id="product"
      style={{
        background: "var(--rc-bg)",
        padding: "120px 24px",
        borderTop: "1px solid var(--rc-border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ marginBottom: "80px", maxWidth: "540px" }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "var(--rc-ink)",
              marginBottom: "20px",
            }}
          >
            Up and running in an afternoon.
          </h2>
          <p style={{ fontSize: "17px", color: "var(--rc-muted)", lineHeight: 1.7 }}>
            No implementation consultant. No six-week onboarding. RealComply is built to be self-service for busy real estate offices.
          </p>
        </div>

        <div
          ref={stepsRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
        >
          {steps.map(({ n, heading, body }, i) => (
            <div key={n} style={{ position: "relative" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: i === 0 ? "var(--rc-primary)" : "var(--rc-surface)",
                  border: "1px solid var(--rc-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: i === 0 ? "white" : "var(--rc-muted)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {n}
                </span>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--rc-ink)", marginBottom: "12px", letterSpacing: "-0.025em" }}>
                {heading}
              </h3>
              <p style={{ fontSize: "15px", color: "var(--rc-muted)", lineHeight: 1.7, maxWidth: "none" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #product > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
