"use client";

import { useReveal } from "@/hooks/use-reveal";

const testimonials = [
  {
    quote: "Our Fair Trading audit last October was the smoothest we've had in twelve years. The auditor commented that our records were some of the best-organised they'd seen. That's entirely RealComply.",
    name: "Sarah Thornton",
    title: "Director of Operations",
    office: "McGrath Estate Agents, Inner West",
  },
  {
    quote: "We were managing CPD on a spreadsheet and trust account checklists on paper. Moving to RealComply took two hours. The first renewal reminder saved one of our agents their licence.",
    name: "James Okafor",
    title: "Licensee in Charge",
    office: "Harcourts, Parramatta",
  },
  {
    quote: "The AML module alone was worth it. Keeping a compliant customer risk register for 300+ transactions a year manually was untenable. Now it's automatic.",
    name: "Michelle Leung",
    title: "Principal",
    office: "Ray White Commercial, Chatswood",
  },
];

export default function Testimonials() {
  const headerRef = useReveal(0.1);
  const cardsRef = useReveal(0.05);

  return (
    <section style={{ background: "#ffffff", padding: "120px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div ref={headerRef as React.RefObject<HTMLDivElement>} className="reveal" style={{ marginBottom: "64px" }}>
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
            What offices say.
          </h2>
          <p style={{ fontSize: "17px", color: "var(--s-ink-mute)", lineHeight: 1.7, maxWidth: "460px" }}>
            From property management-heavy offices to commercial agencies across Australia.
          </p>
        </div>

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="reveal testimonial-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
        >
          {testimonials.map(({ quote, name, title, office }) => (
            <div
              key={name}
              style={{
                background: "#ffffff",
                border: "1px solid var(--s-hairline)",
                borderRadius: "12px",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "var(--s-shadow-card)",
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--s-ink-secondary)",
                  lineHeight: 1.8,
                  flex: 1,
                  marginBottom: "28px",
                  maxWidth: "none",
                }}
              >
                &ldquo;{quote}&rdquo;
              </p>
              <div style={{ borderTop: "1px solid var(--s-hairline)", paddingTop: "18px" }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--s-ink)", marginBottom: "3px" }}>{name}</div>
                <div style={{ fontSize: "13px", color: "var(--s-ink-mute)" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "var(--s-ink-mute)", marginTop: "2px", opacity: 0.7 }}>{office}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
