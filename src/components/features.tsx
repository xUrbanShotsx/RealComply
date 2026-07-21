"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/use-reveal";

const features = [
  {
    id: "cpd",
    heading: "CPD & Licence Tracking",
    body: "Never miss a renewal. Every agent's CPD hours, licence expiry, and learning obligations are tracked in one view. Automated reminders go to individuals and their managers — well before the deadline.",
    detail: "Covers NSW, VIC, QLD, WA, SA, ACT, TAS and NT CPD frameworks. Syncs with your team roster automatically.",
    accent: "var(--rc-accent)",
  },
  {
    id: "trust",
    heading: "Trust Accounting Compliance",
    body: "Monthly reconciliations, audit trails, and exception alerts built around your state's trust accounting legislation. Designed for property managers who need to demonstrate compliance at any moment.",
    detail: "Aligned to the Property and Stock Agents Act 2002 (NSW) and equivalent state frameworks.",
    accent: "oklch(0.68 0.145 145)",
  },
  {
    id: "audit",
    heading: "Audit Readiness",
    body: "Generate a complete audit pack in minutes — not days. Every checklist, record, and policy version is date-stamped, attributed, and retrievable. When NSW Fair Trading calls, you're ready.",
    detail: "Structured around the PSBA audit framework. One-click export to the required format.",
    accent: "oklch(0.70 0.160 260)",
  },
  {
    id: "aml",
    heading: "AML Compliance Per Property",
    body: "AUSTRAC's anti-money laundering obligations apply to every real estate transaction. RealComply creates an AML risk assessment for each property, tracks customer due diligence, and keeps your register current.",
    detail: "Customer identification, beneficial ownership, and transaction monitoring — all traceable.",
    accent: "oklch(0.72 0.155 50)",
  },
  {
    id: "policies",
    heading: "Policies & Procedures",
    body: "Your office manual, version-controlled and legally current. Distribute policy updates to your team, collect acknowledgements, and prove they've been read — all without the email trail.",
    detail: "Includes 40+ pre-built templates written for Australian real estate operations.",
    accent: "oklch(0.62 0.130 315)",
  },
];

export default function Features() {
  const [active, setActive] = useState("cpd");
  const current = features.find((f) => f.id === active)!;
  const headerRef = useReveal(0.1);
  const contentRef = useReveal(0.05);

  return (
    <section id="features" style={{ padding: "120px 24px", background: "var(--rc-bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ maxWidth: "600px", marginBottom: "72px" }}
        >
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "var(--rc-ink)",
              marginBottom: "20px",
            }}
          >
            Every compliance obligation,
            <br />
            one platform.
          </h2>
          <p style={{ fontSize: "17px", color: "var(--rc-muted)", lineHeight: 1.7 }}>
            Australian real estate compliance is multi-layered and state-specific. RealComply was built around it — not adapted from a generic compliance tool.
          </p>
        </div>

        {/* Feature explorer */}
        <div
          ref={contentRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}
        >
          {/* Left: list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {features.map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                style={{
                  textAlign: "left",
                  padding: "20px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: active === f.id ? "var(--rc-surface)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  borderLeft: `3px solid ${active === f.id ? f.accent : "transparent"}`,
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: active === f.id ? "var(--rc-ink)" : "var(--rc-muted)",
                    fontFamily: "var(--font-bricolage)",
                    transition: "color 0.2s ease",
                  }}
                >
                  {f.heading}
                </span>
              </button>
            ))}
          </div>

          {/* Right: detail panel */}
          <div
            key={active}
            style={{
              background: "var(--rc-surface)",
              borderRadius: "16px",
              padding: "40px",
              border: "1px solid var(--rc-border)",
              animation: "panelFade 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                background: current.accent,
                borderRadius: "2px",
                marginBottom: "24px",
              }}
            />
            <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--rc-ink)", marginBottom: "16px" }}>
              {current.heading}
            </h3>
            <p style={{ fontSize: "16px", color: "var(--rc-muted)", lineHeight: 1.75, marginBottom: "20px", maxWidth: "none" }}>
              {current.body}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--rc-faint)",
                lineHeight: 1.6,
                padding: "14px 16px",
                background: "var(--rc-surface-2)",
                borderRadius: "8px",
                borderLeft: `3px solid ${current.accent}`,
                maxWidth: "none",
              }}
            >
              {current.detail}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes panelFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          #features > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
