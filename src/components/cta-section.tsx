"use client";

import { useReveal } from "@/hooks/use-reveal";

export default function CtaSection() {
  const ref = useReveal(0.15);

  return (
    <section style={{ background: "oklch(0.13 0.030 260)", padding: "120px 24px" }}>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="reveal"
        style={{ maxWidth: "860px", margin: "0 auto" }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "60px", alignItems: "center" }} className="cta-grid">
          <div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, color: "white", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "20px" }}>
              Stop worrying about compliance. Start running your business.
            </h2>
            <p style={{ fontSize: "16px", color: "oklch(0.65 0.015 260)", lineHeight: 1.7, maxWidth: "none" }}>
              Join 200+ Australian real estate offices that have made compliance a solved problem. Audit-ready from day one.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", flexShrink: 0 }}>
            <a
              href="/signup"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                background: "white",
                color: "oklch(0.13 0.030 260)",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "15px",
                whiteSpace: "nowrap",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
            >
              Get started free
            </a>
            <a
              href="#"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                background: "transparent",
                color: "oklch(0.65 0.015 260)",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "15px",
                border: "1px solid oklch(0.28 0.025 260)",
                whiteSpace: "nowrap",
                transition: "border-color 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "oklch(0.45 0.025 260)"; el.style.color = "white"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "oklch(0.28 0.025 260)"; el.style.color = "oklch(0.65 0.015 260)"; }}
            >
              Book a demo
            </a>
            <p style={{ fontSize: "12px", color: "oklch(0.45 0.015 260)", maxWidth: "none", margin: 0, paddingLeft: "4px" }}>
              No credit card · Cancel any time
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cta-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
      `}</style>
    </section>
  );
}
