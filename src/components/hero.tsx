"use client";

export default function Hero() {
  return (
    <section
      style={{
        background: "oklch(0.10 0.025 295)",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "80px",
      }}
    >
      {/* Background glows */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 75% 55%, oklch(0.22 0.08 295 / 0.28), transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 40% 40% at 15% 20%, oklch(0.25 0.06 295 / 0.14), transparent)",
          pointerEvents: "none",
        }}
      />

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
            gap: "80px",
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
                  gap: "8px",
                  background: "oklch(0.18 0.050 295)",
                  border: "1px solid oklch(0.28 0.07 295)",
                  borderRadius: "100px",
                  padding: "6px 14px 6px 8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "oklch(0.80 0.06 295)",
                  marginBottom: "32px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#8c52ff",
                    flexShrink: 0,
                  }}
                />
                Built for Australian real estate
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "var(--font-display), system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(3rem, 5.5vw, 5.5rem)",
                color: "white",
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
                  color: "#8c52ff",
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
                fontSize: "1.125rem",
                color: "oklch(0.66 0.022 295)",
                lineHeight: 1.75,
                maxWidth: "480px",
                marginBottom: "44px",
              }}
            >
              RealComply gives real estate offices a single, audit-ready record of every compliance
              obligation — CPD, trust accounting, AML, policies, and more.
            </p>

            {/* CTAs */}
            <div
              className="hero-fade"
              style={{
                animationDelay: "0.58s",
                display: "flex",
                gap: "12px",
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
                marginTop: "22px",
                fontSize: "13px",
                color: "oklch(0.46 0.022 295)",
              }}
            >
              No credit card required · Set up in under 15 minutes
            </p>
          </div>

          {/* Right — dashboard mockup */}
          <div className="hero-fade hero-mockup" style={{ animationDelay: "0.3s" }}>
            <div
              style={{
                background: "oklch(0.14 0.025 295)",
                border: "1px solid oklch(0.22 0.035 295)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow:
                  "0 40px 80px oklch(0.04 0.015 295 / 0.7), 0 0 0 1px oklch(0.22 0.035 295)",
              }}
            >
              {/* Window chrome */}
              <div
                style={{
                  background: "oklch(0.17 0.028 295)",
                  borderBottom: "1px solid oklch(0.22 0.035 295)",
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "oklch(0.60 0.17 25)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "oklch(0.72 0.18 60)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "oklch(0.62 0.17 145)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "oklch(0.48 0.022 295)",
                    marginLeft: "10px",
                    fontFamily: "var(--font-inter)",
                  }}
                >
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
                    background: "oklch(0.10 0.022 295)",
                    borderRadius: "10px",
                    border: "1px solid oklch(0.20 0.030 295)",
                  }}
                >
                  {/* Score ring — r=38, circumference≈239, 94%≈225 */}
                  <svg
                    width="86"
                    height="86"
                    viewBox="0 0 90 90"
                    style={{ flexShrink: 0 }}
                    aria-label="Compliance score: 94 out of 100"
                  >
                    <circle
                      cx="45"
                      cy="45"
                      r="38"
                      fill="none"
                      stroke="oklch(0.22 0.035 295)"
                      strokeWidth="7"
                    />
                    <circle
                      cx="45"
                      cy="45"
                      r="38"
                      fill="none"
                      stroke="#8c52ff"
                      strokeWidth="7"
                      strokeLinecap="round"
                      className="score-ring"
                      transform="rotate(-90 45 45)"
                    />
                    <text
                      x="45"
                      y="41"
                      textAnchor="middle"
                      fill="white"
                      fontSize="18"
                      fontWeight="800"
                      fontFamily="system-ui, sans-serif"
                    >
                      94
                    </text>
                    <text
                      x="45"
                      y="57"
                      textAnchor="middle"
                      fill="oklch(0.50 0.022 295)"
                      fontSize="10"
                      fontFamily="system-ui, sans-serif"
                    >
                      / 100
                    </text>
                  </svg>

                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "white",
                        marginBottom: "4px",
                      }}
                    >
                      Overall Compliance Score
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "oklch(0.62 0.17 145)",
                        fontWeight: 600,
                      }}
                    >
                      Audit-ready
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "oklch(0.48 0.022 295)",
                        marginTop: "4px",
                      }}
                    >
                      Last updated today, 9:41am
                    </div>
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
                      borderBottom:
                        i < arr.length - 1 ? "1px solid oklch(0.19 0.028 295)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: ok ? "oklch(0.62 0.17 145)" : "oklch(0.72 0.18 60)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          color: "oklch(0.80 0.018 295)",
                          fontWeight: 500,
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "100px",
                        background: ok ? "oklch(0.22 0.060 145)" : "oklch(0.22 0.060 60)",
                        color: ok ? "oklch(0.72 0.14 145)" : "oklch(0.78 0.13 60)",
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
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.08em",
            color: "oklch(0.40 0.022 295)",
            fontWeight: 600,
          }}
        >
          SCROLL
        </span>
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
        /* r=38, circumference=238.76≈239; 94%=224.6≈225 */
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
          background: linear-gradient(to bottom, oklch(0.40 0.022 295), transparent);
          animation: scrollPulse 1.8s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.8; transform: scaleY(1); }
          50% { opacity: 0.25; transform: scaleY(0.4); }
        }
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          padding: 14px 28px;
          background: #8c52ff;
          color: white;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .btn-hero-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-hero-ghost {
          display: inline-flex;
          align-items: center;
          padding: 14px 28px;
          background: oklch(0.16 0.028 295);
          color: oklch(0.76 0.022 295);
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          border: 1px solid oklch(0.26 0.035 295);
          transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
        }
        .btn-hero-ghost:hover {
          border-color: oklch(0.42 0.04 295);
          color: white;
          background: oklch(0.18 0.035 295);
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-mockup { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .line-reveal, .hero-fade {
            opacity: 1; clip-path: none; transform: none; animation: none;
          }
          .score-ring { stroke-dasharray: 225 239; animation: none; }
          .scroll-line { animation: none; }
        }
      `}</style>
    </section>
  );
}
