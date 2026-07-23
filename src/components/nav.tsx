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
        transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
        background: scrolled ? "rgba(255, 255, 255, 0.92)" : "#ffffff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--rc-border)" : "1px solid transparent",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/RealComply (2000 x 1000 px).png" alt="RealComply" style={{ height: "46px", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
        </a>

        {/* Desktop links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "32px" }}
          className="nav-links"
        >
          {["Product", "Features", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--rc-muted)",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--rc-ink)")}
              onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--rc-muted)")}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} className="nav-ctas">
          <a
            href="/signin"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--rc-muted)",
              transition: "color 0.2s ease",
            }}
          >
            Sign in
          </a>
          <a
            href="/signup"
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              background: "var(--rc-primary)",
              color: "white",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px oklch(0.36 0.140 260 / 0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
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
          <div style={{ width: "24px", height: "2px", background: "var(--rc-ink)", marginBottom: "5px", borderRadius: "2px" }} />
          <div style={{ width: "24px", height: "2px", background: "var(--rc-ink)", marginBottom: "5px", borderRadius: "2px" }} />
          <div style={{ width: "16px", height: "2px", background: "var(--rc-ink)", borderRadius: "2px" }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "var(--rc-bg)",
            borderTop: "1px solid var(--rc-border)",
          }}
        >
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {["Product", "Features", "Pricing", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{ fontSize: "16px", fontWeight: 500, color: "var(--rc-ink)" }}
              >
                {item}
              </a>
            ))}
            <div style={{ borderTop: "1px solid var(--rc-border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="/signin" style={{ fontSize: "15px", color: "var(--rc-muted)" }}>Sign in</a>
              <a
                href="/signup"
                style={{
                  padding: "12px 20px",
                  background: "var(--rc-primary)",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: 600,
                  textAlign: "center",
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
