"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "border-color 0.3s ease",
        background: "#ffffff",
        borderBottom: scrolled ? `1px solid var(--s-hairline)` : "1px solid transparent",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/RealComply (2000 x 1000 px).png" alt="RealComply" style={{ height: "52px", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
        </a>

        {/* Desktop links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "28px" }}
          className="nav-links"
        >
          {[
            { label: "Product", href: "#product" },
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: "14px",
                fontWeight: 400,
                color: "var(--s-ink-mute)",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--s-ink)")}
              onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--s-ink-mute)")}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="nav-ctas">
          <a
            href="/signin"
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "var(--s-ink-mute)",
              padding: "8px 12px",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--s-ink)")}
            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--s-ink-mute)")}
          >
            Sign in
          </a>
          <a
            href="/signup"
            style={{
              padding: "8px 18px",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 500,
              background: "var(--s-primary)",
              color: "white",
              transition: "background 0.15s ease, transform 0.15s ease",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--s-primary-deep)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--s-primary)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Sign up
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
          className="nav-hamburger"
          aria-label="Toggle menu"
        >
          <div style={{ width: "22px", height: "1.5px", background: "var(--s-ink)", marginBottom: "5px", borderRadius: "2px" }} />
          <div style={{ width: "22px", height: "1.5px", background: "var(--s-ink)", marginBottom: "5px", borderRadius: "2px" }} />
          <div style={{ width: "14px", height: "1.5px", background: "var(--s-ink)", borderRadius: "2px" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "#ffffff",
            borderTop: `1px solid var(--s-hairline)`,
          }}
        >
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Product", href: "#product" },
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: "16px", fontWeight: 400, color: "var(--s-ink)" }}
              >
                {label}
              </a>
            ))}
            <div style={{ borderTop: `1px solid var(--s-hairline)`, paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="/signin" style={{ fontSize: "15px", color: "var(--s-ink-mute)" }}>Sign in</a>
              <a
                href="/signup"
                style={{
                  padding: "12px 20px",
                  background: "var(--s-primary)",
                  color: "white",
                  borderRadius: "9999px",
                  fontWeight: 500,
                  textAlign: "center",
                  fontSize: "15px",
                }}
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links, .nav-ctas { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
}
