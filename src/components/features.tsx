"use client";

import { useReveal } from "@/hooks/use-reveal";

/* ─── Shared mockup wrapper ─── */
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
        background: "oklch(0.13 0.025 295)",
        border: "1px solid oklch(0.20 0.035 295)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 32px 64px oklch(0.04 0.015 295 / 0.55)",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          background: "oklch(0.17 0.028 295)",
          borderBottom: "1px solid oklch(0.20 0.030 295)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "oklch(0.60 0.17 25)", display: "inline-block" }} />
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "oklch(0.72 0.18 60)", display: "inline-block" }} />
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "oklch(0.62 0.17 145)", display: "inline-block" }} />
        <span style={{ fontSize: "11px", color: "oklch(0.46 0.020 295)", marginLeft: "10px" }}>{title}</span>
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
        <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Team Licences</span>
        <span style={{ fontSize: "12px", color: "oklch(0.62 0.17 145)", fontWeight: 600 }}>4 / 5 current</span>
      </div>
      <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid oklch(0.20 0.030 295)" }}>
        {staff.map(({ name, cls, ok, exp }, i) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: i < staff.length - 1 ? "1px solid oklch(0.17 0.025 295)" : "none",
              background: ok ? "oklch(0.15 0.022 295)" : "oklch(0.16 0.038 60)",
            }}
          >
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: ok ? "oklch(0.62 0.17 145)" : "oklch(0.72 0.18 60)",
                flexShrink: 0,
                marginRight: "10px",
              }}
            />
            <span style={{ fontSize: "12.5px", color: "oklch(0.85 0.014 295)", flex: 1 }}>{name}</span>
            <span style={{ fontSize: "11px", color: "oklch(0.52 0.022 295)", marginRight: "12px" }}>{cls}</span>
            <span
              style={{
                fontSize: "11px",
                color: ok ? "oklch(0.65 0.12 145)" : "oklch(0.78 0.12 60)",
                background: ok ? "oklch(0.22 0.055 145)" : "oklch(0.24 0.075 60)",
                padding: "2px 9px",
                borderRadius: "100px",
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
          background: "oklch(0.10 0.022 295)",
          borderRadius: "6px",
          fontSize: "11px",
          color: "oklch(0.50 0.022 295)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Reminder sent · Emma Winters · 2 days ago</span>
        <span style={{ color: "#8c52ff", fontWeight: 600, cursor: "pointer" }}>View all →</span>
      </div>
    </MockupFrame>
  );
}

/* ─── Trust mockup ─── */
function TrustMockup() {
  return (
    <MockupFrame title="Trust Accounts">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Trust Accounts</span>
        <span style={{ fontSize: "12px", color: "oklch(0.62 0.17 145)", fontWeight: 600 }}>All balanced</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        {[
          { type: "SALES TRUST", amount: "$1,248,530", date: "Today, 9:41am" },
          { type: "PROPERTY MGMT", amount: "$342,180", date: "Today, 9:41am" },
        ].map(({ type, amount, date }) => (
          <div
            key={type}
            style={{
              background: "oklch(0.10 0.022 295)",
              borderRadius: "8px",
              padding: "14px",
              border: "1px solid oklch(0.19 0.028 295)",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "oklch(0.50 0.022 295)",
                marginBottom: "6px",
              }}
            >
              {type}
            </div>
            <div
              style={{
                fontSize: "17px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.02em",
                marginBottom: "8px",
              }}
            >
              {amount}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ color: "oklch(0.62 0.17 145)", fontSize: "12px" }}>✓</span>
              <span style={{ fontSize: "10.5px", color: "oklch(0.52 0.022 295)" }}>
                Reconciled · {date}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "oklch(0.48 0.022 295)",
          textAlign: "center",
          paddingTop: "10px",
          borderTop: "1px solid oklch(0.18 0.025 295)",
        }}
      >
        June 2025 · All accounts balanced &nbsp;·&nbsp;{" "}
        <span style={{ color: "#8c52ff", fontWeight: 600, cursor: "pointer" }}>Export report →</span>
      </div>
    </MockupFrame>
  );
}

/* ─── AML mockup ─── */
function AMLMockup() {
  const checks = [
    { label: "Identity documents sighted", done: true },
    { label: "Proof of address verified", done: true },
    { label: "Beneficial ownership recorded", done: true },
    { label: "Source of funds noted", done: true },
    { label: "PEP & sanctions check completed", done: true },
  ];
  return (
    <MockupFrame title="AML Checklist — 23 Harbour St, Sydney">
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "2px" }}>
          AML Checklist
        </div>
        <div style={{ fontSize: "11px", color: "oklch(0.52 0.022 295)" }}>
          23 Harbour St, Sydney &nbsp;·&nbsp; Client: John &amp; Mary Smith
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "14px" }}>
        {checks.map(({ label, done }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 10px",
              borderRadius: "6px",
              background: "oklch(0.15 0.022 295)",
            }}
          >
            <span style={{ fontSize: "13px", color: "oklch(0.62 0.17 145)", flexShrink: 0, lineHeight: 1 }}>
              {done ? "✓" : "○"}
            </span>
            <span style={{ fontSize: "12px", color: "oklch(0.80 0.016 295)" }}>{label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "oklch(0.10 0.022 295)",
          borderRadius: "8px",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "12px", color: "oklch(0.62 0.022 295)" }}>Risk assessment</span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            background: "oklch(0.22 0.055 145)",
            color: "oklch(0.72 0.14 145)",
            padding: "3px 10px",
            borderRadius: "100px",
          }}
        >
          Low ●
        </span>
      </div>
      <button
        style={{
          width: "100%",
          padding: "10px 16px",
          background: "#8c52ff",
          color: "white",
          borderRadius: "8px",
          border: "none",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Mark complete
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
          <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Audit Pack</div>
          <div style={{ fontSize: "11px", color: "oklch(0.52 0.022 295)", marginTop: "2px" }}>
            June 2025
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#8c52ff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            94
          </div>
          <div style={{ fontSize: "10px", color: "oklch(0.50 0.022 295)" }}>/ 100</div>
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
              background: done ? "transparent" : "oklch(0.16 0.038 60)",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: done ? "oklch(0.62 0.17 145)" : "oklch(0.72 0.18 60)",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              {done ? "✓" : "△"}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: done ? "oklch(0.78 0.018 295)" : "oklch(0.84 0.040 60)",
                flex: 1,
              }}
            >
              {label}
            </span>
            {note && (
              <span style={{ fontSize: "10px", color: "oklch(0.70 0.12 60)", whiteSpace: "nowrap" }}>
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
          background: "#8c52ff",
          color: "white",
          borderRadius: "8px",
          border: "none",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
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
    bg: "var(--rc-bg)",
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
    bg: "var(--rc-page)",
  },
  {
    id: "aml",
    badge: "AML Records",
    heading: "Record your AML checks. Simply.",
    body: "AUSTRAC requires real estate agencies to complete customer due diligence for every transaction. RealComply gives you a simple per-property checklist to record that each step was done — with a timestamp and full audit trail, not a spreadsheet.",
    legislation:
      "Covers customer identification, beneficial ownership, and transaction monitoring record-keeping under the AML/CTF Act 2006.",
    flip: false,
    Mockup: AMLMockup,
    bg: "var(--rc-bg)",
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
    bg: "var(--rc-page)",
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
    <section
      style={{
        background: bg,
        padding: "100px 24px",
      }}
    >
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
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#8c52ff",
              marginBottom: "18px",
              background: "oklch(0.95 0.04 295)",
              padding: "4px 12px",
              borderRadius: "100px",
            }}
          >
            {badge}
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
              fontWeight: 800,
              color: "var(--rc-ink)",
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
              color: "var(--rc-muted)",
              lineHeight: 1.8,
              marginBottom: "24px",
              maxWidth: "none",
            }}
          >
            {body}
          </p>
          <div
            style={{
              padding: "14px 16px",
              background: bg === "var(--rc-bg)" ? "var(--rc-page)" : "var(--rc-bg)",
              borderRadius: "8px",
              border: "1px solid var(--rc-border)",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--rc-faint)",
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
      <section
        style={{
          background: "var(--rc-bg)",
          padding: "100px 24px 60px",
        }}
      >
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 800,
              color: "var(--rc-ink)",
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
              color: "var(--rc-muted)",
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
