"use client";

import { useReveal } from "@/hooks/use-reveal";

const pillars = [
  "CPD & Licence Tracking",
  "Trust Account Compliance",
  "AML Due Diligence",
  "Audit Readiness",
  "Policies & Procedures",
  "NSW Fair Trading Aligned",
];

export default function TrustBar() {
  const ref = useReveal(0.1);

  return (
    <section style={{ background: "oklch(0.13 0.030 260)", padding: "28px 24px" }}>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="reveal"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0",
          justifyContent: "center",
        }}
      >
        {pillars.map((p, i) => (
          <div key={p} style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "oklch(0.75 0.015 260)", whiteSpace: "nowrap", padding: "4px 20px" }}>
              {p}
            </span>
            {i < pillars.length - 1 && (
              <span style={{ width: "1px", height: "14px", background: "oklch(0.28 0.020 260)", flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
