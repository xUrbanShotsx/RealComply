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
        background: "#1c1e54",
        padding: "20px 0",
        overflow: "hidden",
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
                fontSize: "12px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.50)",
                whiteSpace: "nowrap",
                padding: "0 28px",
                letterSpacing: "0.01em",
              }}
            >
              {p}
            </span>
            <span
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
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
