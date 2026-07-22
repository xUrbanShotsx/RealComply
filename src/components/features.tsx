"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/use-reveal";

const features = [
  {
    id: "cpd",
    heading: "CPD & Licence Tracking",
    body: "Every agent's CPD hours, licence expiry, and learning obligations in one view. Automated reminders go to individuals and managers well before deadlines — so no one's licence lapses under your watch.",
    detail: "Covers NSW, VIC, QLD, WA, SA, ACT, TAS and NT CPD frameworks. Syncs with your team roster automatically.",
    color: "oklch(0.36 0.14 260)",
  },
  {
    id: "trust",
    heading: "Trust Account Compliance",
    body: "Monthly reconciliations, transaction logs, and exception alerts built around your state's trust accounting legislation. Demonstrate compliance at any moment — not just at audit time.",
    detail: "Aligned to the Property and Stock Agents Act 2002 (NSW) and equivalent state frameworks.",
    color: "oklch(0.42 0.14 145)",
  },
  {
    id: "audit",
    heading: "Audit Readiness",
    body: "Generate a complete audit pack in minutes. Every checklist, record, and policy version is date-stamped, attributed, and retrievable. When NSW Fair Trading calls, you're ready before they finish the sentence.",
    detail: "Structured around the PSBA audit framework. One-click export to the required format.",
    color: "oklch(0.38 0.13 220)",
  },
  {
    id: "aml",
    heading: "AML Compliance",
    body: "AUSTRAC's anti-money laundering obligations apply to every real estate transaction. RealComply creates an AML risk assessment per property, tracks customer due diligence, and keeps your register current.",
    detail: "Customer identification, beneficial ownership, and transaction monitoring — all traceable and audit-ready.",
    color: "oklch(0.46 0.15 50)",
  },
  {
    id: "policies",
    heading: "Policies & Procedures",
    body: "Your office manual, version-controlled and legally current. NSW Fair Trading and REI-aligned templates, distributed to your team with acknowledgement tracking built in.",
    detail: "40+ pre-built templates written for Australian real estate. Updated when legislation changes.",
    color: "oklch(0.42 0.13 315)",
  },
];

export default function Features() {
  const [active, setActive] = useState("cpd");
  const current = features.find((f) => f.id === active)!;
  const headerRef = useReveal(0.1);
  const contentRef = useReveal(0.05);

  return (
    <section id="features" style={{ padding: "120px 24px", background: "var(--rc-bg)", borderTop: "1px solid var(--rc-border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div ref={headerRef as React.RefObject<HTMLDivElement>} className="reveal" style={{ marginBottom: "72px" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "20px" }}>
            Every obligation.<br />One platform.
          </h2>
          <p style={{ fontSize: "17px", color: "var(--rc-muted)", lineHeight: 1.7, maxWidth: "520px" }}>
            Australian real estate compliance is multi-layered and state-specific. RealComply was built around it — not adapted from a generic tool.
          </p>
        </div>

        <div ref={contentRef as React.RefObject<HTMLDivElement>} className="reveal features-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "40px", alignItems: "start" }}>
          {/* Tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                style={{
                  textAlign: "left",
                  padding: "16px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: active === f.id ? "var(--rc-surface)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ width: "3px", height: "20px", borderRadius: "2px", background: active === f.id ? f.color : "transparent", flexShrink: 0, transition: "background 0.15s ease" }} />
                <span style={{ fontSize: "15px", fontWeight: active === f.id ? 700 : 500, color: active === f.id ? "var(--rc-ink)" : "var(--rc-muted)", transition: "color 0.15s ease", fontFamily: "var(--font-inter)" }}>
                  {f.heading}
                </span>
              </button>
            ))}
          </div>

          {/* Panel */}
          <div key={active} style={{ background: "var(--rc-surface)", borderRadius: "16px", padding: "48px", border: "1px solid var(--rc-border)", animation: "panelFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ width: "32px", height: "3px", background: current.color, borderRadius: "2px", marginBottom: "28px" }} />
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--rc-ink)", marginBottom: "16px", letterSpacing: "-0.03em" }}>
              {current.heading}
            </h3>
            <p style={{ fontSize: "16px", color: "var(--rc-muted)", lineHeight: 1.8, marginBottom: "28px", maxWidth: "none" }}>
              {current.body}
            </p>
            <div style={{ padding: "16px 20px", background: "var(--rc-bg)", borderRadius: "8px", border: "1px solid var(--rc-border)" }}>
              <p style={{ fontSize: "13.5px", color: "var(--rc-faint)", lineHeight: 1.65, maxWidth: "none", margin: 0 }}>
                {current.detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes panelFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
