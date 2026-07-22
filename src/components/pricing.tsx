"use client";

import { useReveal } from "@/hooks/use-reveal";

const plans = [
  {
    name: "Essentials",
    price: { monthly: 129 },
    description: "For single-office agencies getting compliance under control.",
    features: [
      "Up to 20 team members",
      "CPD & licence tracking",
      "Trust account checklists",
      "Policies & procedures library",
      "Email reminders & alerts",
      "Audit export (PDF)",
    ],
    cta: "Sign up",
    highlight: false,
  },
  {
    name: "Standard",
    price: { monthly: 249 },
    description: "For growing offices with complex compliance requirements.",
    features: [
      "Up to 60 team members",
      "Everything in Essentials",
      "AML compliance per property",
      "Full audit readiness suite",
      "Legislative update alerts",
      "Priority support",
      "Dedicated onboarding session",
    ],
    cta: "Sign up",
    highlight: true,
  },
  {
    name: "Professional",
    price: { monthly: 549 },
    description: "For large offices and multi-branch operations.",
    features: [
      "Up to 120 team members",
      "Everything in Standard",
      "Multi-office dashboard",
      "Custom policy templates",
      "Compliance reporting suite",
      "Dedicated account manager",
      "SLA-backed support",
    ],
    cta: "Sign up",
    highlight: false,
  },
];

export default function Pricing() {
  const annual = false;
  const headerRef = useReveal(0.1);
  const cardsRef = useReveal(0.05);

  return (
    <section
      id="pricing"
      style={{
        background: "var(--rc-surface)",
        padding: "120px 24px",
        borderTop: "1px solid var(--rc-border)",
        borderBottom: "1px solid var(--rc-border)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--rc-ink)", marginBottom: "16px" }}>
            Straightforward pricing
          </h2>
          <p style={{ fontSize: "17px", color: "var(--rc-muted)", lineHeight: 1.7, margin: "0 auto 32px" }}>
            No per-user fees. No per-property charges. One flat rate per office, per month.
          </p>

        </div>

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", alignItems: "start" }}
        >
          {plans.map(({ name, price, description, features, cta, highlight }) => (
            <div
              key={name}
              style={{
                background: highlight ? "var(--rc-primary)" : "var(--rc-bg)",
                border: `1px solid ${highlight ? "transparent" : "var(--rc-border)"}`,
                borderRadius: "18px",
                padding: "40px 36px",
                position: "relative",
              }}
            >
              {highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--rc-accent)",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "4px 16px",
                    borderRadius: "100px",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.02em",
                  }}
                >
                  Most popular
                </div>
              )}

              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: highlight ? "oklch(0.75 0.060 260)" : "var(--rc-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {name}
                </span>
              </div>

              <div style={{ marginBottom: "16px" }}>
                {price.monthly ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "2.8rem", fontWeight: 800, color: highlight ? "white" : "var(--rc-ink)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                      ${price.monthly}
                    </span>
                    <span style={{ fontSize: "14px", color: highlight ? "oklch(0.75 0.060 260)" : "var(--rc-muted)" }}>/mo</span>
                  </div>
                ) : (
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.03em" }}>
                    Custom
                  </span>
                )}
              </div>

              <p style={{ fontSize: "14px", color: highlight ? "oklch(0.80 0.040 260)" : "var(--rc-muted)", lineHeight: 1.6, marginBottom: "28px", maxWidth: "none" }}>
                {description}
              </p>

              <a
                href={cta === "Talk to us" ? "#contact" : "/signup"}
                className={highlight ? "btn-plan-highlight" : "btn-plan-default"}
                style={{ display: "block", padding: "12px 24px", borderRadius: "10px", textAlign: "center", fontWeight: 700, fontSize: "15px", marginBottom: "32px" }}
              >
                {cta}
              </a>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                {features.map((feat) => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: highlight ? "oklch(0.87 0.030 260)" : "var(--rc-muted)" }}>
                    <span style={{ color: "var(--rc-accent)", flexShrink: 0, marginTop: "1px", fontSize: "16px" }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "var(--rc-faint)", maxWidth: "none" }}>
          No credit card required. Cancel any time.
        </p>
      </div>

      <style>{`
        .btn-plan-highlight {
          background: white;
          color: var(--rc-primary);
          transition: opacity 0.15s ease;
          font-family: var(--font-inter);
        }
        .btn-plan-highlight:hover { opacity: 0.88; }
        .btn-plan-default {
          background: var(--rc-primary);
          color: white;
          transition: opacity 0.15s ease;
          font-family: var(--font-inter);
        }
        .btn-plan-default:hover { opacity: 0.88; }
      `}</style>
    </section>
  );
}
