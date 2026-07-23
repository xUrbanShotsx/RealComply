"use client";

export const dynamic = "force-dynamic";

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

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px", borderRadius: "6px",
    border: "1px solid #e3e8ee", background: "#fff",
    fontSize: "14px", color: "#0d253d", outline: "none",
    transition: "border-color 0.15s", fontFamily: "var(--font-inter)",
  };

  return (
    <div style={{ minHeight: "100svh", background: "#f6f9fc", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "0 32px", background: "#fff", borderBottom: "1px solid #e3e8ee" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", height: "68px", display: "flex", alignItems: "center" }}>
          <Link href="/">
            <img src="/RealComply (2000 x 1000 px).png" alt="RealComply" style={{ height: "44px", width: "auto", objectFit: "contain", mixBlendMode: "multiply" }} />
          </Link>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: "380px", background: "#fff", border: "1px solid #e3e8ee", borderRadius: "12px", padding: "36px 32px", boxShadow: "0 4px 16px rgba(0,55,112,0.07), 0 1px 4px rgba(0,55,112,0.05)" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 600, color: "#0d253d", letterSpacing: "-0.04em", marginBottom: "6px", lineHeight: 1.2 }}>Sign in</h1>
          <p style={{ fontSize: "14px", color: "#64748d", marginBottom: "28px", maxWidth: "none" }}>
            Access your compliance dashboard.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label htmlFor="email" style={{ fontSize: "11.5px", fontWeight: 600, color: "#64748d", letterSpacing: "0.03em", textTransform: "uppercase" }}>Email</label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@youragency.com.au"
                style={fieldStyle}
                onFocus={(e) => (e.target.style.borderColor = "#533afd")}
                onBlur={(e) => (e.target.style.borderColor = "#e3e8ee")}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label htmlFor="password" style={{ fontSize: "11.5px", fontWeight: 600, color: "#64748d", letterSpacing: "0.03em", textTransform: "uppercase" }}>Password</label>
                <a href="#" style={{ fontSize: "12.5px", color: "#533afd", fontWeight: 500 }}>Forgot password?</a>
              </div>
              <input
                id="password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={fieldStyle}
                onFocus={(e) => (e.target.style.borderColor = "#533afd")}
                onBlur={(e) => (e.target.style.borderColor = "#e3e8ee")}
              />
            </div>

            {error && (
              <p style={{ fontSize: "13px", color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 13px", maxWidth: "none", margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              style={{ marginTop: "4px", padding: "10px 24px", background: "#533afd", color: "white", borderRadius: "6px", fontWeight: 600, fontSize: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1, transition: "opacity 0.15s", fontFamily: "var(--font-inter)", width: "100%", letterSpacing: "-0.01em" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: "20px", fontSize: "13.5px", color: "#64748d", textAlign: "center", maxWidth: "none" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#533afd", fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
