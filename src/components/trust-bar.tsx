"use client";

const pillars = [
  "Property & Stock Agents Act 2002",
  "CPD & Licence Tracking",
  "AUSTRAC AML/CTF Compliance",
  "Trust Accounting Legislation",
  "NSW Fair Trading Standards",
  "PSBA Audit Framework",
  "AML Due Diligence",
  "Policies & Procedures",
  "Audit Readiness",
  "Certificate of Registration",
  "Buyers Agency Compliance",
  "Strata Management Obligations",
];

export default function TrustBar() {
  const doubled = [...pillars, ...pillars];

  return (
    <section
      aria-label="Compliance coverage"
      style={{
        background: "oklch(0.13 0.028 295)",
        padding: "22px 0",
        overflow: "hidden",
        borderTop: "1px solid oklch(0.19 0.030 295)",
        borderBottom: "1px solid oklch(0.19 0.030 295)",
      }}
    >
      <div className="marquee-track" aria-hidden>
        {doubled.map((p, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <span
              style={{
                fontSize: "12.5px",
                fontWeight: 500,
                color: "oklch(0.68 0.018 295)",
                whiteSpace: "nowrap",
                padding: "0 28px",
              }}
            >
              {p}
            </span>
            <span
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "oklch(0.32 0.050 295)",
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        .marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: marqueeScroll 40s linear infinite;
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
