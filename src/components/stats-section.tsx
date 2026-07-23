"use client";

import { useReveal } from "@/hooks/use-reveal";

export default function StatsSection() {
  const ref = useReveal(0.2);

  return (
    <section
      style={{
        background: "#1c1e54",
        padding: "80px 24px",
      }}
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="reveal"
        style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "clamp(1.35rem, 2.5vw, 1.9rem)",
            color: "rgba(255,255,255,0.48)",
            lineHeight: 1.65,
            fontWeight: 300,
            letterSpacing: "-0.02em",
            maxWidth: "none",
          }}
        >
          Over{" "}
          <strong style={{ color: "white", fontWeight: 500 }}>
            200 offices
          </strong>{" "}
          across{" "}
          <strong style={{ color: "white", fontWeight: 500 }}>
            8 Australian states
          </strong>{" "}
          track{" "}
          <strong style={{ color: "#b9b9f9", fontWeight: 500 }}>
            40+ compliance obligations
          </strong>{" "}
          in RealComply — all in one place, always audit-ready.
        </p>
      </div>
    </section>
  );
}
