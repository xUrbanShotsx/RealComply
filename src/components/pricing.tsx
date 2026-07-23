"use client";

import { useReveal } from "@/hooks/use-reveal";

const sharedFeatures = [
  "CPD & licence tracking",
  "Trust account checklists",
  "Policies & procedures library",
  "Marketing tracking per listing",
  "Complaints & incident registers",
  "Meeting diary",
  "Email reminders & alerts",
  "Full audit readiness suite",
  "Audit export (PDF)",
  "Legislative update alerts",
  "Priority support",
];

const plans = [
  {
    name: "Small",
    price: { monthly: 129 },
    description: "For single-office agencies getting compliance under control.",
    members: "Up to 20 team members",
    cta: "Sign up",
    highlight: false,
  },
  {
    name: "Medium",
    price: { monthly: 249 },
    description: "For growing offices with complex compliance requirements.",
    members: "Up to 60 team members",
    cta: "Sign up",
    highlight: true,
  },
  {
    name: "Large",
    price: { monthly: 549 },
    description: "For large offices and multi-branch operations.",
    members: "Up to 120 team members",
    cta: "Sign up",
    highlight: false,
  },
];

export default function Pricing() {
  const headerRef = useReveal(0.1);
  const cardsRef = useReveal(0.05);

  return (
    <section
      id="pricing"
      style={{
        background: "#f6f9fc",
        padding: "120px 24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 300,
              color: "var(--s-ink)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: "16px",
            }}
          >
            Straightforward pricing
          </h2>
          <p style={{ fontSize: "17px", color: "var(--s-ink-mute)", lineHeight: 1.7, margin: "0 auto 32px" }}>
            No per-user fees. No per-property charges. One flat rate per office, per month.
          </p>
        </div>

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", alignItems: "start" }}
        >
          {plans.map(({ name, price, description, members, cta, highlight }) => (
            <div
              key={name}
              style={{
                /* Featured card = Stripe brand dark navy */
                background: highlight ? "#1c1e54" : "#ffffff",
                border: highlight ? "none" : "1px solid var(--s-hairline)",
                borderRadius: "16px",
                padding: "36px 32px",
                position: "relative",
                boxShadow: highlight
                  ? "0 16px 48px rgba(28,30,84,0.22), 0 4px 12px rgba(28,30,84,0.10)"
                  : "var(--s-shadow-card)",
              }}
            >
              {highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--s-primary)",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 500,
                    padding: "4px 14px",
                    borderRadius: "9999px",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                >
                  Most popular
                </div>
              )}

              <div style={{ marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: highlight ? "rgba(255,255,255,0.55)" : "var(--s-ink-mute)",
                  }}
                >
                  {name}
                </span>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span
                    className="tnum"
                    style={{
                      fontSize: "2.75rem",
                      fontWeight: 300,
                      color: highlight ? "white" : "var(--s-ink)",
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    ${price.monthly}
                  </span>
                  <span style={{ fontSize: "14px", color: highlight ? "rgba(255,255,255,0.45)" : "var(--s-ink-mute)" }}>/mo</span>
                </div>
              </div>

              <p
                style={{
                  fontSize: "14px",
                  color: highlight ? "rgba(255,255,255,0.55)" : "var(--s-ink-mute)",
                  lineHeight: 1.6,
                  marginBottom: "24px",
                  maxWidth: "none",
                }}
              >
                {description}
              </p>

              <a
                href={cta === "Talk to us" ? "#contact" : "/signup"}
                style={{
                  display: "block",
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  textAlign: "center",
                  fontWeight: 500,
                  fontSize: "14px",
                  marginBottom: "28px",
                  transition: "background 0.15s ease",
                  background: highlight ? "white" : "var(--s-primary)",
                  color: highlight ? "#1c1e54" : "white",
                }}
              >
                {cta}
              </a>

              {/* Team member count — the key differentiator */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 14px", borderRadius: "8px", marginBottom: "20px",
                background: highlight ? "rgba(255,255,255,0.10)" : "rgba(83,58,253,0.06)",
                border: highlight ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(83,58,253,0.12)",
              }}>
                <span style={{ fontSize: "15px" }}>👥</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: highlight ? "white" : "var(--s-ink)" }}>{members}</span>
              </div>

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {sharedFeatures.map((feat) => (
                  <li
                    key={feat}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      fontSize: "14px",
                      color: highlight ? "rgba(255,255,255,0.65)" : "var(--s-ink-mute)",
                    }}
                  >
                    <span style={{ color: highlight ? "#b9b9f9" : "var(--s-primary)", flexShrink: 0, marginTop: "1px", fontWeight: 600 }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <p style={{ fontSize: "13.5px", color: "var(--s-ink-mute)", maxWidth: "none", marginBottom: "6px" }}>
            All plans include every feature — the only difference is team member count and storage.
          </p>
          <p style={{ fontSize: "12.5px", color: "var(--s-ink-mute)", maxWidth: "none", opacity: 0.65 }}>
            Sign up for a 14 day free trial · No lock in contracts
          </p>
        </div>
      </div>
    </section>
  );
}
