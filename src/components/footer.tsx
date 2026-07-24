"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Security", href: "#" },
        { label: "Changelog", href: "#" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Data Processing", href: "/data-processing" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  return (
    <footer style={{ background: "var(--rc-surface)", borderTop: "1px solid var(--rc-border)", padding: "80px 24px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "64px" }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ marginBottom: "20px" }}>
              <img src="/RealComply (2000 x 1000 px).png" alt="RealComply" style={{ height: "52px", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
            </div>
            <p style={{ fontSize: "14px", color: "var(--rc-muted)", lineHeight: 1.75, maxWidth: "280px" }}>
              The compliance platform built for Australian real estate businesses. CPD, trust accounting, AML, audit readiness — one place.
            </p>
            <p style={{ fontSize: "12px", color: "var(--rc-faint)", marginTop: "20px" }}>
              ABN 42 640 098 221 · Sydney, NSW
            </p>
          </div>

          {/* Columns */}
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "18px" }}>
                {heading}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      style={{ fontSize: "14px", color: "var(--rc-muted)", transition: "color 0.15s ease" }}
                      onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--rc-ink)")}
                      onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--rc-muted)")}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--rc-border)", paddingTop: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none" }}>
            © {year} RealComply Pty Ltd. All rights reserved.
          </p>
          <p style={{ fontSize: "13px", color: "var(--rc-faint)", maxWidth: "none" }}>
            Built for Australian real estate · Not legal advice
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
