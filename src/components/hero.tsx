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
            <h1
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontWeight: 300,
                fontSize: "clamp(2.8rem, 5.2vw, 5.2rem)",
                color: "var(--s-ink)",
                lineHeight: 1.0,
                letterSpacing: "-0.04em",
                marginBottom: "28px",
              }}
            >
              <span className="line-reveal" style={{ display: "block", animationDelay: "0.08s" }}>
                CRM &amp; Compliance
              </span>
              <span className="line-reveal" style={{ display: "block", color: "var(--s-primary)", animationDelay: "0.22s" }}>
                built for agents.
              </span>
            </h1>

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
              REA Hub gives Australian real estate agencies a single platform for managing listings, prospecting, vendor reporting, and every compliance obligation — audit-ready from day one.
            </p>

            <div
              className="hero-fade"
              style={{ animationDelay: "0.58s", display: "flex", gap: "10px", flexWrap: "wrap" }}
            >
              <a href="/signup" className="btn-hero-primary">Get started free</a>
              <a href="#features" className="btn-hero-ghost">See what&apos;s included</a>
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
              Sign up for a 14 day free trial · No lock in contracts
            </p>

            {/* Two-pillar badges */}
            <div className="hero-fade" style={{ animationDelay: "0.84s", display: "flex", gap: "10px", marginTop: "32px", flexWrap: "wrap" }}>
              {[
                { label: "CRM", desc: "Listings · Pipeline · Prospecting" },
                { label: "Compliance", desc: "CPD · Trust · Audit Pack" },
              ].map(({ label, desc }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)", border: "1px solid rgba(83,58,253,0.12)", borderRadius: "10px", padding: "10px 16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--s-primary)", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--s-ink-mute)" }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dual dashboard mockup */}
          <div className="hero-fade hero-mockup" style={{ animationDelay: "0.3s" }}>
            <div
              style={{
                background: "#f6f9fc",
                border: "1px solid #e3e8ee",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,55,112,0.08), 0 40px 80px rgba(0,55,112,0.06)",
              }}
            >
              {/* Window chrome */}
              <div style={{ background: "#ffffff", borderBottom: "1px solid #e3e8ee", padding: "12px 18px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#fc5c57", display: "inline-block" }} />
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#fdbc40", display: "inline-block" }} />
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#34c84a", display: "inline-block" }} />
                <span style={{ fontSize: "11px", color: "#8898aa", marginLeft: "10px" }}>REA Hub — Spinelli Real Estate</span>
              </div>

              {/* Panel body */}
              <div style={{ padding: "18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                {/* LEFT: CRM snapshot */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#8898aa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>CRM</div>
                  {[
                    { label: "Active Listings", value: "12", color: "#22c55e" },
                    { label: "Appraisals", value: "8", color: "#3b82f6" },
                    { label: "Open Homes (Sat)", value: "4", color: "#8b5cf6" },
                    { label: "Pipeline GCI", value: "$348K", color: "#f59e0b" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e3e8ee" }}>
                      <span style={{ fontSize: "12px", color: "#273951" }}>{label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: "4px", padding: "9px 12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e3e8ee" }}>
                    <div style={{ fontSize: "10px", color: "#8898aa", marginBottom: "4px" }}>LISTINGS THIS WEEK</div>
                    <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "28px" }}>
                      {[40, 60, 35, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? "#533afd" : "rgba(83,58,253,0.15)", borderRadius: "2px" }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Compliance snapshot */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#8898aa", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>Compliance</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e3e8ee" }}>
                    <svg width="48" height="48" viewBox="0 0 56 56" aria-label="94 / 100">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#e3e8ee" strokeWidth="4.5" />
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#533afd" strokeWidth="4.5" strokeLinecap="round" className="score-ring" transform="rotate(-90 28 28)" />
                      <text x="28" y="25" textAnchor="middle" fill="#0d253d" fontSize="11" fontWeight="700" fontFamily="system-ui">94</text>
                      <text x="28" y="36" textAnchor="middle" fill="#8898aa" fontSize="7" fontFamily="system-ui">/ 100</text>
                    </svg>
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#0d253d", marginBottom: "2px" }}>Compliance Score</div>
                      <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>Audit-ready</div>
                    </div>
                  </div>
                  {[
                    { label: "CPD & Licences", status: "8/9 current", ok: true },
                    { label: "Trust Accounts", status: "Balanced", ok: true },
                    { label: "Marketing", status: "12 listings", ok: true },
                    { label: "Policies", status: "Review due", ok: false },
                  ].map(({ label, status, ok }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e3e8ee" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: ok ? "#22c55e" : "#f59e0b", flexShrink: 0 }} />
                        <span style={{ fontSize: "11.5px", color: "#273951" }}>{label}</span>
                      </div>
                      <span style={{ fontSize: "10.5px", padding: "2px 8px", borderRadius: "9999px", background: ok ? "rgba(34,197,94,0.10)" : "rgba(245,158,11,0.10)", color: ok ? "#16a34a" : "#b45309", fontWeight: 600, whiteSpace: "nowrap" }}>{status}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .line-reveal {
          opacity: 0;
          clip-path: inset(0 0 100% 0);
          animation: lineReveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes lineReveal { to { opacity: 1; clip-path: inset(0 0 0% 0); } }
        .hero-fade {
          opacity: 0;
          transform: translateY(16px);
          animation: heroFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes heroFade { to { opacity: 1; transform: translateY(0); } }
        .score-ring {
          stroke-dasharray: 0 138;
          animation: ringFill 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
        }
        @keyframes ringFill { to { stroke-dasharray: 130 138; } }
        .btn-hero-primary {
          display: inline-flex; align-items: center; padding: 10px 20px;
          background: var(--s-primary); color: white; border-radius: 9999px;
          font-weight: 500; font-size: 14px;
          transition: background 0.15s ease, transform 0.15s ease; white-space: nowrap;
        }
        .btn-hero-primary:hover { background: var(--s-primary-deep); transform: translateY(-1px); }
        .btn-hero-ghost {
          display: inline-flex; align-items: center; padding: 10px 20px;
          background: transparent; color: var(--s-ink); border-radius: 9999px;
          font-weight: 500; font-size: 14px; border: 1px solid var(--s-hairline);
          transition: border-color 0.15s ease, background 0.15s ease; white-space: nowrap;
        }
        .btn-hero-ghost:hover { border-color: var(--s-primary-subdued); background: rgba(83,58,253,0.04); }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-mockup { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .line-reveal, .hero-fade { opacity: 1; clip-path: none; transform: none; animation: none; }
          .score-ring { stroke-dasharray: 130 138; animation: none; }
        }
      `}</style>
    </section>
  );
}
