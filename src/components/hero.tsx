"use client";

export default function Hero() {
  return (
    <section
      style={{
        background: "var(--rc-bg)",
        borderBottom: "1px solid var(--rc-border)",
        paddingTop: "160px",
        paddingBottom: "120px",
        paddingLeft: "24px",
        paddingRight: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 70% 40%, oklch(0.36 0.14 260 / 0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="hero-grid">

          {/* Left */}
          <div>
            <div className="hero-fade" style={{ animationDelay: "0s" }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--rc-primary)",
                  marginBottom: "24px",
                }}
              >
                Built for Australian real estate
              </span>
            </div>

            <h1
              className="hero-fade"
              style={{
                animationDelay: "0.1s",
                fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
                fontWeight: 800,
                color: "var(--rc-ink)",
                lineHeight: 1.0,
                letterSpacing: "-0.04em",
                marginBottom: "28px",
              }}
            >
              Compliance
              <br />
              you can prove.
            </h1>

            <p
              className="hero-fade"
              style={{
                animationDelay: "0.2s",
                fontSize: "1.125rem",
                color: "var(--rc-muted)",
                lineHeight: 1.7,
                maxWidth: "460px",
                marginBottom: "40px",
              }}
            >
              RealComply gives real estate offices a single, audit-ready record of every compliance obligation — CPD, trust accounting, AML, policies, and more.
            </p>

            <div
              className="hero-fade"
              style={{ animationDelay: "0.3s", display: "flex", gap: "12px", flexWrap: "wrap" }}
            >
              <a href="/signup" className="btn-primary">Get started free</a>
              <a href="#features" className="btn-outline">See what's included</a>
            </div>

            <p
              className="hero-fade"
              style={{
                animationDelay: "0.4s",
                marginTop: "24px",
                fontSize: "13px",
                color: "var(--rc-faint)",
              }}
            >
              No credit card required · Set up in under 15 minutes
            </p>
          </div>

          {/* Right — compliance pillars */}
          <div className="hero-fade hero-right" style={{ animationDelay: "0.2s" }}>
            <div
              style={{
                border: "1px solid var(--rc-border)",
                borderRadius: "16px",
                overflow: "hidden",
                background: "var(--rc-surface)",
              }}
            >
              {[
                { label: "CPD & Licence Tracking", status: "All licences current", ok: true },
                { label: "Trust Account Reconciliation", status: "3 accounts reconciled", ok: true },
                { label: "AML Customer Due Diligence", status: "14 checks this quarter", ok: true },
                { label: "Policies & Procedures", status: "2 due for review", ok: false },
                { label: "Audit Pack", status: "Ready to export", ok: true },
              ].map(({ label, status, ok }, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 24px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--rc-border)" : "none",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: ok
                          ? "oklch(0.62 0.17 145)"
                          : "oklch(0.72 0.16 55)",
                      }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--rc-ink)" }}>{label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: ok ? "oklch(0.48 0.13 145)" : "oklch(0.50 0.13 55)",
                      background: ok ? "oklch(0.96 0.025 145)" : "oklch(0.97 0.025 55)",
                      padding: "4px 10px",
                      borderRadius: "100px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {status}
                  </span>
                </div>
              ))}
              <div
                style={{
                  padding: "16px 24px",
                  background: "var(--rc-bg)",
                  borderTop: "1px solid var(--rc-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--rc-faint)" }}>Overall compliance score</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--rc-primary)" }}>94 / 100</span>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--rc-faint)", textAlign: "center", marginTop: "12px" }}>
              Your compliance, at a glance.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .hero-fade {
          opacity: 0;
          transform: translateY(20px);
          animation: heroFade 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes heroFade {
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-primary {
          display: inline-block;
          padding: 14px 28px;
          background: var(--rc-primary);
          color: white;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-outline {
          display: inline-block;
          padding: 14px 28px;
          background: transparent;
          color: var(--rc-ink);
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          border: 1px solid var(--rc-border);
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .btn-outline:hover { border-color: var(--rc-primary); background: var(--rc-surface); }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-right { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade { opacity: 1; transform: none; animation: none; }
        }
      `}</style>
    </section>
  );
}
