"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agency, setAgency] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { agency_name: agency } },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1px solid var(--rc-border)", background: "var(--rc-bg)",
    fontSize: "15px", color: "var(--rc-ink)", outline: "none",
    transition: "border-color 0.15s ease", fontFamily: "var(--font-inter)",
  };

  return (
    <div style={{ minHeight: "100svh", background: "var(--rc-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "0 24px", borderBottom: "1px solid var(--rc-border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", height: "64px", display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: "var(--rc-primary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h6M3 12h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "17px", letterSpacing: "-0.03em", color: "var(--rc-ink)" }}>RealComply</span>
          </Link>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.035em", marginBottom: "8px" }}>Create account</h1>
          <p style={{ fontSize: "15px", color: "var(--rc-muted)", marginBottom: "32px", maxWidth: "none" }}>
            Get started with RealComply for your agency.
          </p>

          {success ? (
            <div style={{ padding: "20px", background: "var(--rc-primary-light)", borderRadius: "10px", textAlign: "center" }}>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--rc-primary)", margin: "0 0 4px", maxWidth: "none" }}>Account created!</p>
              <p style={{ fontSize: "13px", color: "var(--rc-primary)", margin: 0, maxWidth: "none" }}>Redirecting to your dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="agency" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Agency name</label>
                <input
                  id="agency" type="text" required
                  value={agency} onChange={(e) => setAgency(e.target.value)}
                  placeholder="e.g. Ray White Bondi Junction"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="email" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Email</label>
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@youragency.com.au"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="password" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Password</label>
                <input
                  id="password" type="password" autoComplete="new-password" required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")}
                />
              </div>

              {error && (
                <p style={{ fontSize: "14px", color: "oklch(0.55 0.18 25)", background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.88 0.06 25)", borderRadius: "8px", padding: "10px 14px", maxWidth: "none", margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit" disabled={loading}
                style={{ marginTop: "8px", padding: "13px 24px", background: "var(--rc-primary)", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s ease", fontFamily: "var(--font-inter)", width: "100%" }}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--rc-muted)", textAlign: "center", maxWidth: "none" }}>
            Already have an account?{" "}
            <Link href="/signin" style={{ color: "var(--rc-primary)", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
