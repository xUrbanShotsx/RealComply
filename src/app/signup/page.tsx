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

  // Step 3 disclosure
  const [acknowledged, setAcknowledged] = useState(false);

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
              <p style={{ fontSize: "15px", color: "var(--rc-muted)", marginBottom: "36px", textAlign: "center", maxWidth: "none" }}>Sign up for a 14 day free trial · No lock in contracts</p>

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

                {/* Disclosure Statement */}
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--rc-ink)", marginBottom: "8px", letterSpacing: "-0.01em" }}>
                    Disclosure Statement & Terms of Use
                  </div>
                  <div style={{
                    height: "260px", overflowY: "auto", border: "1px solid var(--rc-border)", borderRadius: "10px",
                    padding: "18px 20px", fontSize: "12.5px", color: "var(--rc-muted)", lineHeight: 1.75,
                    background: "var(--rc-surface-2)",
                  }}>
                    <p style={{ fontWeight: 700, color: "var(--rc-ink)", marginBottom: "10px", maxWidth: "none" }}>IMPORTANT — PLEASE READ CAREFULLY BEFORE PROCEEDING</p>

                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>This Disclosure Statement governs your access to and use of the RealComply platform (&ldquo;the Platform&rdquo;). By ticking the acknowledgement box below and proceeding to payment, you (&ldquo;the Subscriber&rdquo;, &ldquo;you&rdquo;, or &ldquo;your organisation&rdquo;) confirm that you have read, understood, and agree to be bound by the terms and conditions set out in this Disclosure Statement and RealComply&apos;s full Terms of Service and Privacy Policy.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>1. Nature of the Platform — Not Legal or Compliance Advice</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>RealComply is a software-as-a-service compliance management tool designed to assist real estate agencies in organising and tracking their compliance obligations. The Platform provides checklists, document storage, policy templates, reminders, and reporting tools as a practical aid only. Nothing provided through the Platform constitutes legal advice, professional compliance advice, accounting advice, or any other form of regulated professional advice. RealComply Pty Ltd is not a law firm, compliance consultancy, or licensed professional body. You should not rely on any content, template, checklist, or feature of the Platform as a substitute for independent professional advice tailored to your specific circumstances.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>2. Your Sole Responsibility for Compliance</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>You acknowledge and agree that compliance with all applicable laws, regulations, codes of conduct, and industry standards — including but not limited to the Property and Stock Agents Act 2002 (NSW) and its regulations, the Anti-Money Laundering and Counter-Terrorism Financing Act 2006 (Cth) and associated AML/CTF rules, the Privacy Act 1988 (Cth), trust accounting obligations under applicable state and territory legislation, CPD requirements imposed by NSW Fair Trading or equivalent regulators in other jurisdictions, workplace health and safety laws, and all other applicable federal, state, and local laws — is your sole and exclusive responsibility. Your use of the Platform does not transfer, reduce, or in any way relieve you of any legal or regulatory obligation. RealComply Pty Ltd does not act as your compliance officer, principal licensee, or agent in any capacity.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>3. No Guarantee of Audit Readiness or Regulatory Approval</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>RealComply makes no representation, warranty, or guarantee — express or implied — that use of the Platform will render your agency audit-ready, ensure a satisfactory outcome in any regulatory audit, investigation, or inspection, result in your agency meeting the requirements of NSW Fair Trading, the Australian Transaction Reports and Analysis Centre (AUSTRAC), the Office of the Australian Information Commissioner, or any other regulatory authority, or prevent, reduce, or mitigate any penalty, fine, sanction, suspension, cancellation of licence, or other regulatory consequence. The outcome of any regulatory audit or investigation depends on factors entirely beyond the control of RealComply, including the quality and accuracy of information you enter into the Platform, the conduct of your principals, licensees, agents, and staff, changes in legislation or regulatory interpretation, and the discretion exercised by the relevant regulatory authority.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>4. Accuracy and Currency of Information</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>Legislation, regulations, codes of conduct, and regulatory guidance applicable to real estate agencies change frequently. While RealComply endeavours to update the Platform&apos;s templates, checklists, and reference materials from time to time, we do not guarantee that any content, checklist, policy template, or compliance framework provided through the Platform is current, complete, or accurate at the time you use it. It is your responsibility to independently verify the currency and accuracy of all compliance requirements applicable to your agency and to seek appropriate professional advice regarding any legislative amendments, new regulations, or changes in regulatory practice. RealComply accepts no responsibility for any loss, penalty, or adverse regulatory outcome arising from your reliance on outdated, incomplete, or inaccurate content within the Platform.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>5. Trust Accounting — Your Exclusive Responsibility</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>Trust accounting is a heavily regulated function under state and territory property legislation and is subject to mandatory auditing requirements. The trust accounting checklists and tracking features within the Platform are provided as an organisational aid only. They do not constitute trust accounting software, replace the requirement for a qualified trust accountant or auditor, or satisfy any mandatory auditing obligation. You remain solely and exclusively responsible for the accurate maintenance of trust accounts, the engagement of qualified auditors, the timely lodgement of audit reports with the relevant regulatory authority, and compliance with all trust accounting obligations under applicable legislation. Any deficiency, discrepancy, or breach in trust accounting is entirely your responsibility.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>6. AML/CTF Obligations</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>If your agency is or becomes a reporting entity under the Anti-Money Laundering and Counter-Terrorism Financing Act 2006 (Cth), you are solely responsible for enrolling with AUSTRAC, implementing and maintaining a compliant AML/CTF program, conducting appropriate customer due diligence and ongoing customer due diligence, submitting required reports to AUSTRAC, and maintaining all records as required by the AML/CTF Rules. The AML/CTF features within the Platform are reference and documentation tools only and do not constitute an approved AML/CTF program or satisfy your obligations under the Act. You must engage appropriate legal or compliance professionals to ensure your AML/CTF program meets all statutory requirements.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>7. Policy Templates — Customisation Required</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>Policy templates provided through the Platform are generic starting points only. They have not been prepared as legal documents for your specific agency and may not reflect the requirements applicable to your office, jurisdiction, licence type, staff composition, or operational circumstances. All templates must be reviewed, customised, and verified by an appropriately qualified legal or compliance professional before adoption or reliance. RealComply accepts no liability for any loss or consequence arising from the adoption or use of unmodified or inadequately reviewed templates.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>8. Data Accuracy — Your Responsibility</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>The Platform produces outputs — including compliance scores, reports, checklists, and audit-ready documents — based entirely on information you and your team enter. The accuracy, completeness, and timeliness of that information is your sole responsibility. RealComply does not verify, validate, or audit data entered by users. Any report, export, or summary generated by the Platform is only as reliable as the information from which it is produced. You should not present Platform-generated reports to a regulatory authority without independently verifying the accuracy and completeness of all underlying data.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>9. Limitation of Liability</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>To the maximum extent permitted by law, RealComply Pty Ltd, its directors, officers, employees, contractors, and agents shall not be liable to you or any third party for any direct, indirect, incidental, consequential, special, or exemplary loss or damage, including but not limited to loss of revenue or profit, regulatory fines or penalties, costs of legal proceedings, loss of licence, loss of data, or reputational damage, arising out of or in connection with your use of or reliance on the Platform, regardless of whether such loss was foreseeable or RealComply had been advised of the possibility of such loss. Where liability cannot be excluded by law, RealComply&apos;s total aggregate liability to you is limited to the total subscription fees paid by you to RealComply in the three (3) months immediately preceding the event giving rise to the claim.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>10. No Indemnification of RealComply for Regulatory Outcomes</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>You expressly acknowledge that RealComply has no control over regulatory decisions, audit outcomes, or enforcement actions taken against your agency. You agree that you will not seek to hold RealComply Pty Ltd responsible for, or seek contribution or indemnification from RealComply in respect of, any regulatory fine, penalty, remediation cost, legal cost, or other adverse outcome arising from any audit, investigation, or enforcement action, whether or not you were using the Platform at the time of any alleged compliance failure.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>11. Staff Training and Supervision</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>You are responsible for ensuring that all staff granted access to the Platform are appropriately trained in their compliance obligations, that the Platform is used correctly and consistently by your team, and that access credentials are kept secure and are not shared with unauthorised persons. RealComply accepts no responsibility for non-compliance, errors, or omissions resulting from improper use of the Platform by your staff or authorised users.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>12. Subscription, Billing, and Cancellation</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>Your subscription is charged on a monthly recurring basis through Stripe. You may cancel at any time through your account settings; cancellation takes effect at the end of the current billing period and no partial-month refunds are issued. RealComply reserves the right to vary subscription pricing on not less than 30 days&apos; written notice. Continued use of the Platform following a pricing change constitutes acceptance of the new pricing.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>13. Privacy and Data</p>
                    <p style={{ marginBottom: "12px", maxWidth: "none" }}>By subscribing, you consent to the collection, storage, and use of information entered into the Platform in accordance with RealComply&apos;s Privacy Policy. You acknowledge that personal information relating to your staff, clients, and properties entered into the Platform is your responsibility to manage in accordance with the Privacy Act 1988 (Cth) and any applicable state privacy legislation. You warrant that you have obtained all necessary consents from individuals whose personal information you enter into the Platform.</p>

                    <p style={{ fontWeight: 600, color: "var(--rc-ink)", marginBottom: "6px", maxWidth: "none" }}>14. Governing Law</p>
                    <p style={{ marginBottom: "4px", maxWidth: "none" }}>This Disclosure Statement and your use of the Platform are governed by the laws of New South Wales, Australia. Any dispute arising in connection with your subscription or use of the Platform shall be subject to the exclusive jurisdiction of the courts of New South Wales.</p>
                  </div>
                </div>

                {/* Acknowledgement checkbox */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", padding: "14px 16px", background: acknowledged ? "oklch(0.96 0.04 295)" : "var(--rc-surface-2)", border: `1.5px solid ${acknowledged ? "var(--rc-primary)" : "var(--rc-border)"}`, borderRadius: "10px", transition: "all 0.15s ease" }}>
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    style={{ marginTop: "2px", width: "16px", height: "16px", flexShrink: 0, accentColor: "var(--rc-primary)", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--rc-ink)", lineHeight: 1.6, maxWidth: "none" }}>
                    I confirm that I have read and understood the Disclosure Statement above. I acknowledge that RealComply is a compliance management tool only and does not constitute legal advice. I accept full responsibility for my agency&apos;s compliance with all applicable laws and regulations, and I understand that RealComply Pty Ltd is not liable for the outcome of any regulatory audit, investigation, or enforcement action.
                  </span>
                </label>

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
                  <button type="button" onClick={() => { setStep(2); setAcknowledged(false); }} style={{ fontSize: "14px", color: "var(--rc-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-inter)", padding: "0" }}>
                    ← Back
                  </button>
                  <button type="submit" disabled={loading || !acknowledged} style={{ padding: "13px 32px", background: "var(--rc-primary)", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "15px", border: "none", cursor: loading || !acknowledged ? "not-allowed" : "pointer", opacity: loading || !acknowledged ? 0.45 : 1, fontFamily: "var(--font-inter)", transition: "opacity 0.15s ease" }}>
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
