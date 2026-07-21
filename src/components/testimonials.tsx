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
    quote: "We were managing CPD on a spreadsheet and trust account checklists on paper. Moving to RealComply took us two hours. The first renewal reminder saved one of our agents their licence.",
    name: "James Okafor",
    title: "Licensee in Charge",
    office: "Harcourts, Parramatta",
  },
  {
    quote: "The AML module alone was worth it for us. Keeping a compliant customer risk register for 300+ transactions a year manually was untenable. Now it's automatic.",
    name: "Michelle Leung",
    title: "Principal",
    office: "Ray White Commercial, Chatswood",
  },
];

export default function Testimonials() {
  const headerRef = useReveal(0.1);
  const cardsRef = useReveal(0.05);

  return (
    <section
      style={{
        background: "var(--rc-bg)",
        padding: "120px 24px",
        borderTop: "1px solid var(--rc-border)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ maxWidth: "520px", marginBottom: "64px" }}
        >
          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, color: "var(--rc-ink)", marginBottom: "16px" }}>
            What compliance officers say
          </h2>
          <p style={{ fontSize: "16px", color: "var(--rc-muted)", lineHeight: 1.7 }}>
            From property management-heavy offices to commercial agencies, real estate businesses across Australia.
          </p>
        </div>

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="reveal"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}
        >
          {testimonials.map(({ quote, name, title, office }) => (
            <div
              key={name}
              style={{
                background: "var(--rc-surface)",
                border: "1px solid var(--rc-border)",
                borderRadius: "16px",
                padding: "36px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                  lineHeight: 1,
                  color: "var(--rc-primary-light)",
                  fontFamily: "var(--font-bricolage)",
                  fontWeight: 800,
                  marginBottom: "16px",
                  userSelect: "none",
                }}
              >
                "
              </div>
              <p style={{ fontSize: "15px", color: "var(--rc-ink)", lineHeight: 1.75, flex: 1, marginBottom: "28px", maxWidth: "none" }}>
                {quote}
              </p>
              <div style={{ borderTop: "1px solid var(--rc-border)", paddingTop: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--rc-ink)", letterSpacing: "-0.01em", marginBottom: "2px" }}>
                  {name}
                </div>
                <div style={{ fontSize: "13px", color: "var(--rc-muted)" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "var(--rc-faint)", marginTop: "2px" }}>{office}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
