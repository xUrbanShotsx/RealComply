"use client";

import { useReveal } from "@/hooks/use-reveal";

export default function CtaSection() {
  const ref = useReveal(0.15);

  return (
    <section
      style={{
        background: "#1c1e54",
        padding: "120px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle indigo radial glow at center */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 55% at 50% 100%, rgba(83,58,253,0.30), transparent)",
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
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            fontWeight: 300,
            color: "white",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: "24px",
          }}
        >
          Stop worrying about compliance.
          <br />
          <span style={{ color: "#b9b9f9" }}>Start running your business.</span>
        </h2>
        <p
          style={{
            fontSize: "17px",
            color: "rgba(255,255,255,0.50)",
            lineHeight: 1.7,
            maxWidth: "520px",
            margin: "0 auto 48px",
            fontWeight: 300,
          }}
        >
          Join 200+ Australian real estate offices that have made compliance a solved problem.
          Audit-ready from day one.
        </p>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/signup"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "var(--s-primary)",
              color: "white",
              borderRadius: "9999px",
              fontWeight: 500,
              fontSize: "15px",
              whiteSpace: "nowrap",
              transition: "background 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--s-primary-deep)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--s-primary)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Get started free
          </a>
          <a
            href="#"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "transparent",
              color: "rgba(255,255,255,0.65)",
              borderRadius: "9999px",
              fontWeight: 400,
              fontSize: "15px",
              border: "1px solid rgba(255,255,255,0.18)",
              whiteSpace: "nowrap",
              transition: "border-color 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "rgba(255,255,255,0.40)";
              el.style.color = "white";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.borderColor = "rgba(255,255,255,0.18)";
              el.style.color = "rgba(255,255,255,0.65)";
            }}
          >
            Book a demo
          </a>
        </div>

        <p
          style={{
            marginTop: "20px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.32)",
            maxWidth: "none",
          }}
        >
          Sign up for a 14 day free trial · No lock in contracts
        </p>
      </div>
    </section>
  );
}
