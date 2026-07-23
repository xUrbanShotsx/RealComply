"use client";

import { useReveal } from "@/hooks/use-reveal";

/* ─── Shared mockup wrapper — light chrome ─── */
function MockupFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#f6f9fc",
        border: "1px solid #e3e8ee",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,55,112,0.08), 0 1px 4px rgba(0,55,112,0.05)",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e3e8ee",
          padding: "11px 16px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#fc5c57", display: "inline-block" }} />
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#fdbc40", display: "inline-block" }} />
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#34c84a", display: "inline-block" }} />
        <span style={{ fontSize: "11px", color: "#8898aa", marginLeft: "10px" }}>{title}</span>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

/* ─── CPD mockup ─── */
function CPDMockup() {
  const staff = [
    { name: "Sarah Mitchell", cls: "Class 1", ok: true, exp: "Nov 2026" },
    { name: "James Chen", cls: "Class 2", ok: true, exp: "Feb 2027" },
    { name: "Priya Kaur", cls: "Class 1", ok: true, exp: "Aug 2026" },
    { name: "Emma Winters", cls: "Class 2", ok: false, exp: "Due 14 Sep" },
    { name: "Michael Hart", cls: "Cert.", ok: true, exp: "Dec 2025" },
  ];
  return (
    <MockupFrame title="Team Licences">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", padding: "0 2px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#0d253d" }}>Team Licences</span>
        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>4 / 5 current</span>
      </div>
      <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e3e8ee" }}>
        {staff.map(({ name, cls, ok, exp }, i) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: i < staff.length - 1 ? "1px solid #eef1f5" : "none",
              background: ok ? "#ffffff" : "rgba(245,158,11,0.06)",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: ok ? "#22c55e" : "#f59e0b",
                flexShrink: 0,
                marginRight: "10px",
              }}
            />
            <span style={{ fontSize: "12.5px", color: "#273951", flex: 1 }}>{name}</span>
            <span style={{ fontSize: "11px", color: "#8898aa", marginRight: "12px" }}>{cls}</span>
            <span
              className="tnum"
              style={{
                fontSize: "11px",
                color: ok ? "#16a34a" : "#b45309",
                background: ok ? "rgba(34,197,94,0.10)" : "rgba(245,158,11,0.10)",
                padding: "2px 9px",
                borderRadius: "9999px",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {exp}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "12px",
          padding: "8px 12px",
          background: "#f6f9fc",
          borderRadius: "6px",
          fontSize: "11px",
          color: "#8898aa",
          display: "flex",
          justifyContent: "space-between",
          border: "1px solid #eef1f5",
        }}
      >
        <span>Reminder sent · Emma Winters · 2 days ago</span>
        <span style={{ color: "#533afd", fontWeight: 500, cursor: "pointer" }}>View all →</span>
      </div>
    </MockupFrame>
  );
}

/* ─── Trust mockup ─── */
function TrustMockup() {
  return (
    <MockupFrame title="Trust Accounts">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#0d253d" }}>Trust Accounts</span>
        <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>All balanced</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        {[
          { type: "SALES TRUST", amount: "$1,248,530", date: "Today, 9:41am" },
          { type: "PROPERTY MGMT", amount: "$342,180", date: "Today, 9:41am" },
        ].map(({ type, amount, date }) => (
          <div
            key={type}
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              padding: "14px",
              border: "1px solid #e3e8ee",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: "#8898aa",
                marginBottom: "6px",
              }}
            >
              {type}
            </div>
            <div
              className="tnum"
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#0d253d",
                letterSpacing: "-0.02em",
                marginBottom: "8px",
              }}
            >
              {amount}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ color: "#16a34a", fontSize: "12px" }}>✓</span>
              <span style={{ fontSize: "10.5px", color: "#8898aa" }}>
                Reconciled · {date}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "#8898aa",
          textAlign: "center",
          paddingTop: "10px",
          borderTop: "1px solid #eef1f5",
        }}
      >
        June 2025 · All accounts balanced &nbsp;·&nbsp;{" "}
        <span style={{ color: "#533afd", fontWeight: 500, cursor: "pointer" }}>Export report →</span>
      </div>
    </MockupFrame>
  );
}

/* ─── Marketing mockup ─── */
function MarketingMockup() {
  const steps = [
    { label: "Listed on realestate.com.au", done: true },
    { label: "Listed on domain.com.au", done: true },
    { label: "Signboard installed", done: true },
    { label: "Open home scheduled & promoted", done: true },
    { label: "Buyer database prospected", done: true },
    { label: "Vendor marketing report sent", done: false },
  ];
  return (
    <MockupFrame title="Marketing Checklist — 14 Rosehill Ave, Wollongong">
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#0d253d", marginBottom: "2px" }}>
          Marketing Checklist
        </div>
        <div style={{ fontSize: "11px", color: "#8898aa" }}>
          14 Rosehill Ave, Wollongong &nbsp;·&nbsp; Listed 3 days ago
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "14px" }}>
        {steps.map(({ label, done }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 10px",
              borderRadius: "6px",
              background: done ? "transparent" : "rgba(245,158,11,0.06)",
            }}
          >
            <span style={{ fontSize: "13px", color: done ? "#16a34a" : "#b45309", flexShrink: 0, lineHeight: 1 }}>
              {done ? "✓" : "○"}
            </span>
            <span style={{ fontSize: "12px", color: done ? "#273951" : "#b45309" }}>{label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "#f6f9fc",
          borderRadius: "8px",
          marginBottom: "12px",
          border: "1px solid #eef1f5",
        }}
      >
        <span style={{ fontSize: "12px", color: "#8898aa" }}>Prospecting progress</span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            background: "rgba(245,158,11,0.10)",
            color: "#b45309",
            padding: "3px 10px",
            borderRadius: "9999px",
          }}
        >
          5 / 6 done
        </span>
      </div>
      <button
        style={{
          width: "100%",
          padding: "10px 16px",
          background: "#533afd",
          color: "white",
          borderRadius: "9999px",
          border: "none",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        Send vendor report →
      </button>
    </MockupFrame>
  );
}

/* ─── Audit mockup ─── */
function AuditMockup() {
  const items = [
    { label: "Licence register (current)", done: true },
    { label: "CPD records (all staff)", done: true },
    { label: "Trust reconciliations (6 months)", done: true },
    { label: "AML risk assessments (14)", done: true },
    { label: "Policy acknowledgements (all staff)", done: true },
    { label: "Supervision policy", done: false, note: "1 review overdue" },
  ];
  return (
    <MockupFrame title="Audit Pack — June 2025">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#0d253d" }}>Audit Pack</div>
          <div style={{ fontSize: "11px", color: "#8898aa", marginTop: "2px" }}>
            June 2025
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            className="tnum"
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#533afd",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            94
          </div>
          <div style={{ fontSize: "10px", color: "#8898aa" }}>/ 100</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "14px" }}>
        {items.map(({ label, done, note }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              borderRadius: "6px",
              background: done ? "transparent" : "rgba(245,158,11,0.06)",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: done ? "#16a34a" : "#b45309",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {done ? "✓" : "△"}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: done ? "#273951" : "#b45309",
                flex: 1,
              }}
            >
              {label}
            </span>
            {note && (
              <span style={{ fontSize: "10px", color: "#b45309", whiteSpace: "nowrap" }}>
                {note}
              </span>
            )}
          </div>
        ))}
      </div>
      <button
        style={{
          width: "100%",
          padding: "11px 16px",
          background: "#533afd",
          color: "white",
          borderRadius: "9999px",
          border: "none",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "background 0.15s",
        }}
      >
        Export PDF →
      </button>
    </MockupFrame>
  );
}

/* ─── Feature showcase data ─── */
const showcases = [
  {
    id: "cpd",
    badge: "CPD & Licences",
    heading: "No more chasing licences.",
    body: "Track every agent's CPD hours, licence class, and expiry date across your entire team. Automated reminders go to individuals and their manager 90, 30, and 7 days before any deadline — so no one's licence lapses under your watch.",
    legislation: "Covers CPD frameworks across NSW, VIC, QLD, WA, SA, ACT, TAS and NT. Syncs with your team roster automatically.",
    flip: false,
    Mockup: CPDMockup,
    bg: "#ffffff",
  },
  {
    id: "trust",
    badge: "Trust Accounting",
    heading: "Reconciliation that's always audit-ready.",
    body: "Monthly reconciliations, transaction logs, and exception alerts built around your state's trust accounting legislation. Demonstrate compliance at any moment — not just when the auditor calls.",
    legislation:
      "Aligned to the Property and Stock Agents Act 2002 (NSW) and equivalent frameworks in every Australian state.",
    flip: true,
    Mockup: TrustMockup,
    bg: "#f6f9fc",
  },
  {
    id: "marketing",
    badge: "Marketing Tracking",
    heading: "Every listing. Fully prospected.",
    body: "Track that every listed property has been properly marketed — portals uploaded, signage installed, open homes promoted, buyer database prospected, and vendor reports sent. Never leave a vendor wondering what happened, and never leave a step undone.",
    legislation:
      "Keeps a date-stamped prospecting record per listing. Demonstrates to vendors and your principal that every marketing obligation was met on time.",
    flip: false,
    Mockup: MarketingMockup,
    bg: "#ffffff",
  },
  {
    id: "audit",
    badge: "Audit Readiness",
    heading: "When Fair Trading calls, you're ready.",
    body: "Generate a complete audit pack in minutes. Every record is date-stamped, attributed, and retrievable in the format auditors expect. When NSW Fair Trading calls, you've already answered.",
    legislation:
      "Structured around the PSBA audit framework. One-click export to the required format.",
    flip: true,
    Mockup: AuditMockup,
    bg: "#f6f9fc",
  },
];

function ShowcaseSection({
  badge,
  heading,
  body,
  legislation,
  flip,
  Mockup,
  bg,
}: (typeof showcases)[0]) {
  const ref = useReveal(0.1);

  return (
    <section style={{ background: bg, padding: "100px 24px" }}>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="reveal showcase-row"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: "80px",
          flexDirection: flip ? "row-reverse" : "row",
        }}
      >
        {/* Copy */}
        <div style={{ flex: "0 0 40%", maxWidth: "460px" }}>
          {/* Stripe pill badge — no uppercase, just a soft label */}
          <span
            style={{
              display: "inline-block",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--s-primary-deep)",
              marginBottom: "20px",
              background: "var(--s-primary-subdued)",
              padding: "4px 12px",
              borderRadius: "9999px",
              opacity: 0.9,
            }}
          >
            {badge}
          </span>
          <h2
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
              fontWeight: 300,
              color: "var(--s-ink)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: "20px",
            }}
          >
            {heading}
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--s-ink-mute)",
              lineHeight: 1.8,
              marginBottom: "24px",
              maxWidth: "none",
            }}
          >
            {body}
          </p>
          {/* Canvas-cream legislation callout */}
          <div
            style={{
              padding: "14px 16px",
              background: "var(--s-canvas-cream)",
              borderRadius: "10px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--s-ink-secondary)",
                lineHeight: 1.65,
                maxWidth: "none",
                margin: 0,
              }}
            >
              {legislation}
            </p>
          </div>
        </div>

        {/* Mockup */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Mockup />
        </div>
      </div>
    </section>
  );
}

export default function Features() {
  const headerRef = useReveal(0.1);

  return (
    <div id="features">
      {/* Section header */}
      <section style={{ background: "#ffffff", padding: "100px 24px 60px" }}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 300,
              color: "var(--s-ink)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: "20px",
            }}
          >
            Every obligation.
            <br />
            One platform.
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "var(--s-ink-mute)",
              lineHeight: 1.7,
              maxWidth: "520px",
            }}
          >
            Australian real estate compliance is multi-layered and state-specific. RealComply was
            built around it — not adapted from a generic tool.
          </p>
        </div>
      </section>

      {/* Alternating showcases */}
      {showcases.map((s) => (
        <ShowcaseSection key={s.id} {...s} />
      ))}

      <style>{`
        @media (max-width: 900px) {
          .showcase-row {
            flex-direction: column !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </div>
  );
}
