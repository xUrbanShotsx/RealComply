"use client";

export default function Hero() {
  return (
    <section
      style={{
        background: "var(--rc-bg)",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle tinted gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "70%",
          background: "linear-gradient(to bottom, var(--rc-surface) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          paddingTop: "160px",
          paddingBottom: "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
          {/* Badge */}
          <div className="hero-fade-up" style={{ animationDelay: "0.05s" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "100px",
                border: "1px solid var(--rc-border)",
                background: "var(--rc-bg)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--rc-primary)",
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--rc-accent)", display: "inline-block" }} />
              Built for Australian real estate
            </span>
          </div>

          {/* Heading */}
          <h1
            className="hero-fade-up"
            style={{
              animationDelay: "0.17s",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 800,
              color: "var(--rc-ink)",
              lineHeight: 1.0,
              maxWidth: "820px",
              letterSpacing: "-0.04em",
            }}
          >
            Compliance,{" "}
            <span style={{ color: "var(--rc-accent-dark)" }}>sorted.</span>
          </h1>

          {/* Sub */}
          <p
            className="hero-fade-up"
            style={{
              animationDelay: "0.29s",
              fontSize: "clamp(1.05rem, 2vw, 1.2rem)",
              color: "var(--rc-muted)",
              maxWidth: "560px",
              lineHeight: 1.65,
              margin: "0 auto",
            }}
          >
            One platform for every compliance obligation your real estate business carries — CPD tracking, trust accounting, AML, audit readiness, and more.
          </p>

          {/* CTAs */}
          <div
            className="hero-fade-up"
            style={{ animationDelay: "0.41s", display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}
          >
            <a href="/signup" className="btn-hero-primary">Sign up</a>
            <a href="#demo" className="btn-hero-outline">Book a demo</a>
          </div>

          {/* Social proof micro */}
          <p
            className="hero-fade-up"
            style={{ animationDelay: "0.53s", fontSize: "13px", color: "var(--rc-faint)", letterSpacing: "0.01em" }}
          >
            Trusted by 200+ Australian real estate offices · No credit card required
          </p>
        </div>

        {/* Dashboard mockup */}
        <div
          className="hero-fade-up"
          style={{ animationDelay: "0.55s", marginTop: "64px", width: "100%", maxWidth: "960px", position: "relative" }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70%",
              height: "80px",
              background: "radial-gradient(ellipse, oklch(0.36 0.140 260 / 0.12) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div
            style={{
              border: "1px solid var(--rc-border)",
              borderRadius: "16px",
              overflow: "hidden",
              background: "oklch(0.11 0.028 260)",
              boxShadow: "0 24px 60px oklch(0.14 0.025 260 / 0.15), 0 0 0 1px var(--rc-border)",
              position: "relative",
            }}
          >
            {/* Window chrome */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid oklch(0.22 0.030 260)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "oklch(0.13 0.030 260)",
              }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "oklch(0.65 0.20 30)" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "oklch(0.75 0.18 90)" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "oklch(0.60 0.18 145)" }} />
              <div
                style={{
                  flex: 1,
                  maxWidth: "280px",
                  margin: "0 auto",
                  height: "22px",
                  background: "oklch(0.20 0.025 260)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "11px", color: "oklch(0.50 0.015 260)" }}>app.realcomply.com.au</span>
              </div>
            </div>

            {/* App layout */}
            <div style={{ display: "flex", height: "400px" }}>
              {/* Sidebar */}
              <div
                style={{
                  width: "200px",
                  flexShrink: 0,
                  borderRight: "1px solid oklch(0.22 0.030 260)",
                  padding: "20px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div style={{ marginBottom: "16px", paddingLeft: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "oklch(0.35 0.020 260)", letterSpacing: "0.08em", textTransform: "uppercase" }}>RealComply</span>
                </div>
                {[
                  { label: "Dashboard", active: true, icon: "▦" },
                  { label: "CPD Tracking", active: false, icon: "◎" },
                  { label: "Audit Ready", active: false, icon: "✓" },
                  { label: "Trust Accounts", active: false, icon: "◈" },
                  { label: "AML Compliance", active: false, icon: "◉" },
                  { label: "Policies & Docs", active: false, icon: "≡" },
                ].map(({ label, active, icon }) => (
                  <div
                    key={label}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "7px",
                      background: active ? "oklch(0.25 0.060 260)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: active ? "var(--rc-accent)" : "oklch(0.38 0.020 260)" }}>{icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: active ? 600 : 400, color: active ? "white" : "oklch(0.42 0.020 260)" }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Main */}
              <div style={{ flex: 1, padding: "20px 24px", overflow: "hidden" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", marginBottom: "4px", letterSpacing: "-0.02em" }}>
                    Compliance Overview
                  </h3>
                  <span style={{ fontSize: "12px", color: "oklch(0.44 0.018 260)" }}>Ray White Bondi Junction · Updated just now</span>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
                  {[
                    { label: "Overall Score", value: "94%", color: "var(--rc-accent)", bg: "oklch(0.20 0.040 195 / 0.4)" },
                    { label: "CPD Hours", value: "38 / 40", color: "oklch(0.80 0.16 90)", bg: "oklch(0.20 0.040 90 / 0.3)" },
                    { label: "Open Items", value: "2", color: "oklch(0.75 0.18 50)", bg: "oklch(0.20 0.040 50 / 0.3)" },
                  ].map(({ label, value, color, bg }) => (
                    <div
                      key={label}
                      style={{
                        background: bg,
                        border: "1px solid oklch(0.28 0.030 260)",
                        borderRadius: "10px",
                        padding: "14px",
                      }}
                    >
                      <div style={{ fontSize: "20px", fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: "11px", color: "oklch(0.45 0.018 260)", marginTop: "4px" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Items list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Q3 Trust Account Reconciliation", status: "Complete", statusColor: "var(--rc-accent)" },
                    { label: "Jane Smith — CPD renewal due 30 Sep", status: "Action needed", statusColor: "oklch(0.75 0.18 50)" },
                    { label: "AML Customer Risk Assessment — 12 Chapel St", status: "In review", statusColor: "oklch(0.78 0.16 90)" },
                    { label: "PM Policies v4.2 — Annual review", status: "Complete", statusColor: "var(--rc-accent)" },
                  ].map(({ label, status, statusColor }) => (
                    <div
                      key={label}
                      style={{
                        background: "oklch(0.15 0.025 260 / 0.6)",
                        border: "1px solid oklch(0.22 0.030 260)",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "oklch(0.78 0.015 260)" }}>{label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: statusColor, flexShrink: 0 }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: "linear-gradient(to bottom, transparent, var(--rc-bg))",
          pointerEvents: "none",
        }}
      />

      <style>{`
        .hero-fade-up {
          opacity: 0;
          transform: translateY(28px);
          animation: heroFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes heroFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-hero-primary {
          padding: 14px 28px;
          background: var(--rc-primary);
          color: white;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          display: inline-block;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px oklch(0.36 0.140 260 / 0.30);
        }
        .btn-hero-outline {
          padding: 14px 28px;
          background: transparent;
          color: var(--rc-ink);
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          border: 1px solid var(--rc-border);
          display: inline-block;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .btn-hero-outline:hover {
          border-color: var(--rc-primary);
          background: var(--rc-surface);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
