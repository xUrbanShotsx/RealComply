"use client";

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "80px",
        /* Stripe gradient mesh — five pastel blobs over white canvas */
        backgroundImage: [
          "radial-gradient(ellipse 85% 90% at -5% 55%, rgba(245,233,212,0.90), transparent 60%)",
          "radial-gradient(ellipse 52% 65% at 20% -5%, rgba(249,107,238,0.40), transparent 55%)",
          "radial-gradient(ellipse 62% 72% at 50% -10%, rgba(185,185,249,0.56), transparent 60%)",
          "radial-gradient(ellipse 48% 58% at 78% -5%, rgba(83,58,253,0.30), transparent 55%)",
          "radial-gradient(ellipse 40% 48% at 100% 22%, rgba(234,34,97,0.25), transparent 50%)",
        ].join(", "),
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 24px 100px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "72px",
            alignItems: "center",
          }}
        >
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="hero-fade" style={{ animationDelay: "0s" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "var(--s-primary-subdued)",
                  borderRadius: "9999px",
                  padding: "5px 14px 5px 9px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--s-primary-deep)",
                  marginBottom: "32px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--s-primary)",
                    flexShrink: 0,
                  }}
                />
                Built for Australian real estate
              </span>
            </div>

            {/* Headline — Inter 300, Stripe display style */}
            <h1
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontWeight: 300,
                fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
                color: "var(--s-ink)",
                lineHeight: 1.0,
                letterSpacing: "-0.04em",
                marginBottom: "28px",
              }}
            >
              <span
                className="line-reveal"
                style={{ display: "block", animationDelay: "0.08s" }}
              >
                Compliance
              </span>
              <span
                className="line-reveal"
                style={{
                  display: "block",
                  color: "var(--s-primary)",
                  animationDelay: "0.22s",
                }}
              >
                you can prove.
              </span>
            </h1>

            {/* Sub */}
            <p
              className="hero-fade"
              style={{
                animationDelay: "0.42s",
                fontSize: "1.0625rem",
                color: "var(--s-ink-mute)",
                lineHeight: 1.75,
                maxWidth: "460px",
                marginBottom: "44px",
                fontWeight: 400,
              }}
            >
              RealComply gives real estate offices a single, audit-ready record of every compliance
              obligation — CPD, trust accounting, AML, policies, and more.
            </p>

            {/* CTAs — pill shape */}
            <div
              className="hero-fade"
              style={{
                animationDelay: "0.58s",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <a href="/signup" className="btn-hero-primary">
                Get started free
              </a>
              <a href="#features" className="btn-hero-ghost">
                See what&apos;s included
              </a>
            </div>

            <p
              className="hero-fade"
              style={{
                animationDelay: "0.72s",
                marginTop: "20px",
                fontSize: "12px",
                color: "var(--s-ink-mute)",
                opacity: 0.7,
              }}
            >
              No credit card required · Set up in under 15 minutes
            </p>
          </div>

          {/* Right — dashboard mockup */}
          <div className="hero-fade hero-mockup" style={{ animationDelay: "0.3s" }}>
            <div
              style={{
                background: "#1c1e54",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "var(--s-shadow-panel), 0 40px 80px rgba(28,30,84,0.20)",
              }}
            >
              {/* Window chrome */}
              <div
                style={{
                  background: "#252762",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#fc5c57", display: "inline-block" }} />
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#fdbc40", display: "inline-block" }} />
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#34c84a", display: "inline-block" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginLeft: "10px" }}>
                  Compliance Overview — Hartley &amp; Associates
                </span>
              </div>

              {/* Panel body */}
              <div style={{ padding: "22px" }}>
                {/* Score panel */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "20px",
                    padding: "18px",
                    background: "rgba(0,0,0,0.25)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <svg width="86" height="86" viewBox="0 0 90 90" style={{ flexShrink: 0 }} aria-label="Compliance score: 94 out of 100">
                    <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="7" />
                    <circle cx="45" cy="45" r="38" fill="none" stroke="#533afd" strokeWidth="7" strokeLinecap="round" className="score-ring" transform="rotate(-90 45 45)" />
                    <text x="45" y="41" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif">94</text>
                    <text x="45" y="57" textAnchor="middle" fill="rgba(255,255,255,0.40)" fontSize="10" fontFamily="system-ui, sans-serif">/ 100</text>
                  </svg>

                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "white", marginBottom: "4px" }}>Overall Compliance Score</div>
                    <div style={{ fontSize: "12px", color: "#34c84a", fontWeight: 600 }}>Audit-ready</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>Last updated today, 9:41am</div>
                  </div>
                </div>

                {/* Module rows */}
                {[
                  { label: "CPD & Licence Tracking", status: "8 / 9 current", ok: true },
                  { label: "Trust Account Reconciliation", status: "Balanced", ok: true },
                  { label: "AML Due Diligence", status: "14 assessed", ok: true },
                  { label: "Policies & Procedures", status: "Review due", ok: false },
                  { label: "Audit Pack", status: "Export ready", ok: true },
                ].map(({ label, status, ok }, i, arr) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 4px",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: ok ? "#34c84a" : "#fdbc40", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.80)", fontWeight: 400 }}>{label}</span>
                    </div>
                    <span
                      className="tnum"
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background: ok ? "rgba(52,200,74,0.15)" : "rgba(253,188,64,0.15)",
                        color: ok ? "#34c84a" : "#fdbc40",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "36px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "10px", letterSpacing: "0.06em", color: "var(--s-ink-mute)", fontWeight: 500, opacity: 0.6 }}>SCROLL</span>
        <div className="scroll-line" />
      </div>

      <style>{`
        .line-reveal {
          opacity: 0;
          clip-path: inset(0 0 100% 0);
          animation: lineReveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes lineReveal {
          to { opacity: 1; clip-path: inset(0 0 0% 0); }
        }
        .hero-fade {
          opacity: 0;
          transform: translateY(16px);
          animation: heroFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes heroFade {
          to { opacity: 1; transform: translateY(0); }
        }
        .score-ring {
          stroke-dasharray: 0 239;
          animation: ringFill 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
        }
        @keyframes ringFill {
          to { stroke-dasharray: 225 239; }
        }
        .scroll-line {
          width: 1px;
          height: 28px;
          background: linear-gradient(to bottom, var(--s-hairline), transparent);
          animation: scrollPulse 1.8s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.7; transform: scaleY(1); }
          50% { opacity: 0.2; transform: scaleY(0.4); }
        }
        /* Stripe pill buttons */
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          background: var(--s-primary);
          color: white;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 14px;
          transition: background 0.15s ease, transform 0.15s ease;
          white-space: nowrap;
        }
        .btn-hero-primary:hover { background: var(--s-primary-deep); transform: translateY(-1px); }
        .btn-hero-ghost {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          background: transparent;
          color: var(--s-ink);
          border-radius: 9999px;
          font-weight: 500;
          font-size: 14px;
          border: 1px solid var(--s-hairline);
          transition: border-color 0.15s ease, background 0.15s ease;
          white-space: nowrap;
        }
        .btn-hero-ghost:hover {
          border-color: var(--s-primary-subdued);
          background: rgba(83,58,253,0.04);
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-mockup { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .line-reveal, .hero-fade { opacity: 1; clip-path: none; transform: none; animation: none; }
          .score-ring { stroke-dasharray: 225 239; animation: none; }
          .scroll-line { animation: none; }
        }
      `}</style>
    </section>
  );
}
