"use client";

import { useReveal } from "@/hooks/use-reveal";

export default function CtaSection() {
  const ref = useReveal(0.15);

  return (
    <section
      style={{
        background: "oklch(0.10 0.025 295)",
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 100%, oklch(0.22 0.08 295 / 0.25), transparent)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="reveal"
        style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.04em",
            lineHeight: 1.02,
            marginBottom: "24px",
          }}
        >
          Stop worrying about compliance.
          <br />
          <span style={{ color: "#8c52ff" }}>Start running your business.</span>
        </h2>
        <p
          style={{
            fontSize: "17px",
            color: "oklch(0.60 0.018 295)",
            lineHeight: 1.7,
            maxWidth: "520px",
            margin: "0 auto 48px",
          }}
        >
          Join 200+ Australian real estate offices that have made compliance a solved problem.
          Audit-ready from day one.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/signup"
            style={{
              display: "inline-block",
              padding: "15px 32px",
              background: "#8c52ff",
              color: "white",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "15px",
              whiteSpace: "nowrap",
              transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Get started free
          </a>
          <a
            href="#"
            style={{
              display: "inline-block",
              padding: "15px 32px",
              background: "transparent",
              color: "oklch(0.65 0.018 295)",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "15px",
              border: "1px solid oklch(0.26 0.030 295)",
              whiteSpace: "nowrap",
              transition: "border-color 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "oklch(0.45 0.030 295)";
              el.style.color = "white";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "oklch(0.26 0.030 295)";
              el.style.color = "oklch(0.65 0.018 295)";
            }}
          >
            Book a demo
          </a>
        </div>

        <p
          style={{
            marginTop: "20px",
            fontSize: "13px",
            color: "oklch(0.42 0.018 295)",
            maxWidth: "none",
          }}
        >
          No credit card required · Cancel any time
        </p>
      </div>
    </section>
  );
}
