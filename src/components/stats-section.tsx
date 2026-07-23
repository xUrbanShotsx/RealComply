"use client";

import { useReveal } from "@/hooks/use-reveal";

export default function StatsSection() {
  const ref = useReveal(0.2);

  return (
    <section
      style={{
        background: "oklch(0.10 0.025 295)",
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
            fontSize: "clamp(1.35rem, 2.5vw, 1.9rem)",
            color: "oklch(0.62 0.022 295)",
            lineHeight: 1.65,
            fontWeight: 400,
            maxWidth: "none",
          }}
        >
          Over{" "}
          <strong
            style={{
              color: "white",
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 800,
            }}
          >
            200 offices
          </strong>{" "}
          across{" "}
          <strong
            style={{
              color: "white",
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 800,
            }}
          >
            8 Australian states
          </strong>{" "}
          track{" "}
          <strong
            style={{
              color: "#8c52ff",
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 800,
            }}
          >
            40+ compliance obligations
          </strong>{" "}
          in RealComply — all in one place, always audit-ready.
        </p>
      </div>
    </section>
  );
}
