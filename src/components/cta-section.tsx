"use client";

import { useReveal } from "@/hooks/use-reveal";

export default function CtaSection() {
  const ref = useReveal(0.15);

  return (
    <section
      style={{
        background: "var(--rc-surface)",
        padding: "120px 24px",
        borderTop: "1px solid var(--rc-border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="reveal"
        style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}
      >
        <h2
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            color: "var(--rc-ink)",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: "28px",
          }}
        >
          Stop worrying about compliance.
          <br />
          Start running your business.
        </h2>

        <p style={{ fontSize: "18px", color: "var(--rc-muted)", lineHeight: 1.7, margin: "0 auto 28px" }}>
          Join 200+ Australian real estate offices that have made compliance a solved problem. Set up in an afternoon. Audit-ready from day one.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" }}>
          <a href="#signup" className="btn-cta-primary">Sign up</a>
          <a href="#demo" className="btn-cta-outline">Book a demo</a>
        </div>

        <p style={{ fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none" }}>
          No credit card required · Set up in under 15 minutes · Cancel any time
        </p>
      </div>

      <style>{`
        .btn-cta-primary {
          padding: 16px 32px;
          background: var(--rc-primary);
          color: white;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          display: inline-block;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px oklch(0.36 0.140 260 / 0.25);
        }
        .btn-cta-outline {
          padding: 16px 32px;
          background: transparent;
          color: var(--rc-ink);
          border: 1px solid var(--rc-border);
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          display: inline-block;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .btn-cta-outline:hover {
          border-color: var(--rc-primary);
          background: var(--rc-bg);
        }
      `}</style>
    </section>
  );
}
