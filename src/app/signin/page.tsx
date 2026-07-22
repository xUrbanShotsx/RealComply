"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={{ minHeight: "100svh", background: "var(--rc-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "0 24px", borderBottom: "1px solid var(--rc-border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", height: "80px", display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src="/RealComply (2000 x 1000 px).png" alt="RealComply" style={{ height: "46px", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
          </Link>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.035em", marginBottom: "8px" }}>Sign in</h1>
          <p style={{ fontSize: "15px", color: "var(--rc-muted)", marginBottom: "32px", maxWidth: "none" }}>
            Enter your email and password to access your account.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="email" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Email</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@youragency.com.au"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--rc-border)", background: "var(--rc-bg)", fontSize: "15px", color: "var(--rc-ink)", outline: "none", transition: "border-color 0.15s ease", fontFamily: "var(--font-inter)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label htmlFor="password" style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Password</label>
                <a href="#" style={{ fontSize: "13px", color: "var(--rc-primary)", fontWeight: 500 }}>Forgot password?</a>
              </div>
              <input
                id="password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--rc-border)", background: "var(--rc-bg)", fontSize: "15px", color: "var(--rc-ink)", outline: "none", transition: "border-color 0.15s ease", fontFamily: "var(--font-inter)" }}
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--rc-muted)", textAlign: "center", maxWidth: "none" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--rc-primary)", fontWeight: 500 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
