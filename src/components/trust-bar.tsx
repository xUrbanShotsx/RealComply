"use client";

import { useReveal } from "@/hooks/use-reveal";

const stats = [
  { value: "200+", label: "Australian offices" },
  { value: "99.8%", label: "Audit pass rate" },
  { value: "12,000+", label: "CPD hours tracked" },
  { value: "Zero", label: "Missed renewal deadlines" },
];

export default function TrustBar() {
  const ref = useReveal(0.1);

  return (
    <section
      style={{
        background: "var(--rc-surface)",
        borderBottom: "1px solid var(--rc-border)",
        padding: "64px 24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px",
            background: "var(--rc-border)",
            border: "1px solid var(--rc-border)",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          {stats.map(({ value, label }) => (
            <div
              key={label}
              style={{
                background: "var(--rc-bg)",
                padding: "32px 28px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 800,
                  color: "var(--rc-primary)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: "14px", color: "var(--rc-muted)", fontWeight: 500 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
