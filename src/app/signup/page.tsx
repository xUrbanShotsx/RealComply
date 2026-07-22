"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    id: "essentials",
    name: "Essentials",
    price: 129,
    description: "For single-office agencies getting compliance under control.",
    features: ["Up to 20 team members", "CPD & licence tracking", "Trust account checklists", "Policies & procedures library", "Email reminders & alerts", "Audit export (PDF)"],
    highlight: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: 249,
    description: "For growing offices with complex compliance requirements.",
    features: ["Up to 60 team members", "Everything in Essentials", "AML compliance per property", "Full audit readiness suite", "Legislative update alerts", "Priority support", "Dedicated onboarding session"],
    highlight: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: 549,
    description: "For large offices and multi-branch operations.",
    features: ["Up to 120 team members", "Everything in Standard", "Multi-office dashboard", "Custom policy templates", "Compliance reporting suite", "Dedicated account manager", "SLA-backed support"],
    highlight: false,
  },
];


export default function SignUpPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [agency, setAgency] = useState("");
  const [abn, setAbn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2
  const [selectedPlan, setSelectedPlan] = useState("standard");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1px solid var(--rc-border)", background: "var(--rc-bg)",
    fontSize: "15px", color: "var(--rc-ink)", outline: "none",
    transition: "border-color 0.15s ease", fontFamily: "var(--font-inter)",
  };

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep(3);
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Create the Supabase account
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { agency_name: agency, abn, plan: selectedPlan } },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Create Stripe Checkout Session and redirect
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, agency, abn, plan: selectedPlan }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      setError(data.error ?? "Failed to start checkout. Please try again.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  const plan = plans.find((p) => p.id === selectedPlan)!;

  return (
    <div style={{ minHeight: "100svh", background: "var(--rc-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "0 24px", borderBottom: "1px solid var(--rc-border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", height: "80px", display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src="/RealComply (2000 x 1000 px).png" alt="RealComply" style={{ height: "46px", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
          </Link>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>

        {/* Step indicator */}
        {!success && (
          <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "40px" }}>
            {[{ n: 1, label: "Account" }, { n: 2, label: "Plan" }, { n: 3, label: "Payment" }].map(({ n, label }, i) => (
              <div key={n} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700,
                    background: step > n ? "var(--rc-primary)" : step === n ? "var(--rc-primary)" : "var(--rc-border)",
                    color: step >= n ? "white" : "var(--rc-muted)",
                    transition: "all 0.2s ease",
                  }}>
                    {step > n ? "✓" : n}
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: step === n ? 600 : 400, color: step >= n ? "var(--rc-ink)" : "var(--rc-muted)", whiteSpace: "nowrap" }}>{label}</span>
                </div>
                {i < 2 && (
                  <div style={{ width: "80px", height: "1px", background: step > n ? "var(--rc-primary)" : "var(--rc-border)", margin: "0 8px", marginBottom: "20px", transition: "background 0.2s ease" }} />
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ width: "100%", maxWidth: step === 2 ? "900px" : "420px", transition: "max-width 0.3s ease" }}>

          {success ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--rc-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "24px" }}>✓</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--rc-ink)", marginBottom: "8px" }}>You're all set!</h2>
              <p style={{ fontSize: "15px", color: "var(--rc-muted)", maxWidth: "none" }}>Taking you to your dashboard…</p>
            </div>
          ) : step === 1 ? (
            <>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.035em", marginBottom: "8px" }}>Create your account</h1>
              <p style={{ fontSize: "15px", color: "var(--rc-muted)", marginBottom: "32px", maxWidth: "none" }}>Get started with RealComply for your agency.</p>

              <form onSubmit={handleStep1} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="agency" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Agency name</label>
                  <input id="agency" type="text" required value={agency} onChange={(e) => setAgency(e.target.value)}
                    placeholder="e.g. Ray White Bondi Junction" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="abn" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>ABN</label>
                  <input id="abn" type="text" required inputMode="numeric"
                    value={abn.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4").replace(/^(\d{2})(\d{3})(\d{3})(\d{1,3})$/, "$1 $2 $3 $4").replace(/^(\d{2})(\d{3})(\d{1,3})$/, "$1 $2 $3").replace(/^(\d{2})(\d{1,3})$/, "$1 $2")}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setAbn(digits);
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--rc-border)";
                      if (abn.length > 0 && abn.length !== 11) setError("ABN must be 11 digits.");
                      else setError("");
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--rc-primary)"; setError(""); }}
                    placeholder="e.g. 12345678901"
                    style={inputStyle} />
                  <p style={{ fontSize: "12px", color: "var(--rc-faint)", margin: 0, maxWidth: "none" }}>11-digit Australian Business Number. One organisation per ABN.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="email" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Email</label>
                  <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@youragency.com.au" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="password" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Password</label>
                  <input id="password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")} />
                </div>
                {error && (
                  <p style={{ fontSize: "14px", color: "oklch(0.55 0.18 25)", background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.88 0.06 25)", borderRadius: "8px", padding: "10px 14px", maxWidth: "none", margin: 0 }}>
                    {error}
                  </p>
                )}
                <button type="submit" disabled={abn.length !== 11} style={{ marginTop: "8px", padding: "13px 24px", background: "var(--rc-primary)", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "15px", border: "none", cursor: abn.length !== 11 ? "not-allowed" : "pointer", opacity: abn.length !== 11 ? 0.6 : 1, fontFamily: "var(--font-inter)", width: "100%" }}>
                  Continue
                </button>
              </form>

              <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--rc-muted)", textAlign: "center", maxWidth: "none" }}>
                Already have an account?{" "}
                <Link href="/signin" style={{ color: "var(--rc-primary)", fontWeight: 500 }}>Sign in</Link>
              </p>
            </>

          ) : step === 2 ? (
            <>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.035em", marginBottom: "8px", textAlign: "center" }}>Choose your plan</h1>
              <p style={{ fontSize: "15px", color: "var(--rc-muted)", marginBottom: "36px", textAlign: "center", maxWidth: "none" }}>No lock-in contracts. Cancel any time.</p>

              <form onSubmit={handleStep2}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }} className="plan-grid">
                  {plans.map((p) => {
                    const active = selectedPlan === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlan(p.id)}
                        style={{
                          textAlign: "left", background: active ? (p.highlight ? "var(--rc-primary)" : "var(--rc-primary-light)") : "var(--rc-bg)",
                          border: `2px solid ${active ? "var(--rc-primary)" : "var(--rc-border)"}`,
                          borderRadius: "16px", padding: "28px 24px", cursor: "pointer", position: "relative",
                          transition: "all 0.15s ease", fontFamily: "var(--font-inter)",
                        }}
                      >
                        {p.highlight && (
                          <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--rc-accent)", color: "white", fontSize: "11px", fontWeight: 700, padding: "3px 14px", borderRadius: "100px", whiteSpace: "nowrap" }}>
                            Most popular
                          </div>
                        )}
                        {active && !p.highlight && (
                          <div style={{ position: "absolute", top: "16px", right: "16px", width: "20px", height: "20px", borderRadius: "50%", background: "var(--rc-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white", fontWeight: 700 }}>✓</div>
                        )}
                        {active && p.highlight && (
                          <div style={{ position: "absolute", top: "16px", right: "16px", width: "20px", height: "20px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "var(--rc-primary)", fontWeight: 700 }}>✓</div>
                        )}
                        <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: active && p.highlight ? "oklch(0.75 0.060 260)" : "var(--rc-muted)", marginBottom: "10px" }}>{p.name}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "10px" }}>
                          <span style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.04em", color: active && p.highlight ? "white" : "var(--rc-ink)" }}>${p.price}</span>
                          <span style={{ fontSize: "13px", color: active && p.highlight ? "oklch(0.75 0.060 260)" : "var(--rc-muted)" }}>/mo</span>
                        </div>
                        <p style={{ fontSize: "13px", color: active && p.highlight ? "oklch(0.80 0.040 260)" : "var(--rc-muted)", lineHeight: 1.5, marginBottom: "20px", maxWidth: "none" }}>{p.description}</p>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                          {p.features.map((f) => (
                            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: active && p.highlight ? "oklch(0.87 0.030 260)" : "var(--rc-muted)" }}>
                              <span style={{ color: active && p.highlight ? "oklch(0.87 0.030 260)" : "var(--rc-primary)", flexShrink: 0, fontSize: "14px" }}>✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button type="button" onClick={() => setStep(1)} style={{ fontSize: "14px", color: "var(--rc-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", padding: "0" }}>
                    ← Back
                  </button>
                  <button type="submit" style={{ padding: "13px 32px", background: "var(--rc-primary)", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "15px", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)" }}>
                    Continue with {plan.name}
                  </button>
                </div>
              </form>
            </>

          ) : (
            <>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.035em", marginBottom: "8px" }}>Review your order</h1>
              <p style={{ fontSize: "15px", color: "var(--rc-muted)", marginBottom: "32px", maxWidth: "none" }}>You&apos;ll complete payment securely on the next screen.</p>

              <form onSubmit={handleStep3} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Order summary */}
                <div style={{ border: "1px solid var(--rc-border)", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rc-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--rc-muted)", marginBottom: "2px" }}>{plan.name} Plan</div>
                      <div style={{ fontSize: "13px", color: "var(--rc-muted)" }}>Monthly subscription</div>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.03em" }}>
                      ${plan.price}<span style={{ fontSize: "13px", fontWeight: 400, color: "var(--rc-muted)" }}>/mo</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px 24px", background: "var(--rc-surface-2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--rc-muted)", marginBottom: "6px" }}>
                      <span>Agency</span><span style={{ color: "var(--rc-ink)", fontWeight: 500 }}>{agency}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--rc-muted)", marginBottom: "6px" }}>
                      <span>ABN</span><span style={{ color: "var(--rc-ink)", fontWeight: 500 }}>{abn.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--rc-muted)" }}>
                      <span>Account</span><span style={{ color: "var(--rc-ink)", fontWeight: 500 }}>{email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "var(--rc-surface-2)", borderRadius: "8px" }}>
                  <span style={{ fontSize: "18px" }}>🔒</span>
                  <span style={{ fontSize: "13px", color: "var(--rc-muted)", maxWidth: "none" }}>Powered by Stripe. Your card details are entered securely and never touch our servers.</span>
                </div>

                {error && (
                  <p style={{ fontSize: "14px", color: "oklch(0.55 0.18 25)", background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.88 0.06 25)", borderRadius: "8px", padding: "10px 14px", maxWidth: "none", margin: 0 }}>
                    {error}
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <button type="button" onClick={() => setStep(2)} style={{ fontSize: "14px", color: "var(--rc-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", padding: "0" }}>
                    ← Back
                  </button>
                  <button type="submit" disabled={loading} style={{ padding: "13px 32px", background: "var(--rc-primary)", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "var(--font-inter)" }}>
                    {loading ? "Redirecting to Stripe…" : `Pay $${plan.price}/mo →`}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .plan-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
