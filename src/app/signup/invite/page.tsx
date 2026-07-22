"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    supabase.from("invites").select("agency_name, email, accepted_at").eq("token", token).single().then(({ data }) => {
      if (!data || data.accepted_at) { setTokenValid(false); return; }
      setTokenValid(true);
      setAgencyName(data.agency_name ?? "");
      if (data.email) setEmail(data.email);
    });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { agency_name: agencyName, invite_token: token, role: "staff" } },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }

    // Mark invite as accepted
    await supabase.from("invites").update({ accepted_at: new Date().toISOString(), email }).eq("token", token!);

    router.push("/signin?invited=1");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1px solid var(--rc-border)", background: "var(--rc-bg)",
    fontSize: "15px", color: "var(--rc-ink)", outline: "none",
    transition: "border-color 0.15s ease", fontFamily: "var(--font-inter)",
  };

  if (tokenValid === null) return <p style={{ color: "var(--rc-muted)", textAlign: "center" }}>Checking invite…</p>;

  if (tokenValid === false) return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--rc-ink)", marginBottom: "8px" }}>Invalid invite</h2>
      <p style={{ color: "var(--rc-muted)", marginBottom: "24px", maxWidth: "none" }}>This invite link is invalid or has already been used.</p>
      <Link href="/" style={{ color: "var(--rc-primary)", fontWeight: 500 }}>Back to home</Link>
    </div>
  );

  return (
    <div style={{ width: "100%", maxWidth: "420px" }}>
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--rc-primary)", marginBottom: "8px" }}>
          You&apos;ve been invited to join
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.035em", marginBottom: "4px" }}>
          {agencyName}
        </h1>
        <p style={{ fontSize: "15px", color: "var(--rc-muted)", maxWidth: "none" }}>
          Create your free account to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--rc-ink)" }}>Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters" style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--rc-primary)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--rc-border)")} />
        </div>

        {error && (
          <p style={{ fontSize: "14px", color: "oklch(0.55 0.18 25)", background: "oklch(0.97 0.02 25)", border: "1px solid oklch(0.88 0.06 25)", borderRadius: "8px", padding: "10px 14px", maxWidth: "none", margin: 0 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: "4px", padding: "13px 24px", background: "var(--rc-primary)", color: "white", borderRadius: "8px", fontWeight: 700, fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "var(--font-inter)" }}>
          {loading ? "Creating account…" : "Accept invite & join"}
        </button>
      </form>

      <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--rc-faint)", textAlign: "center", maxWidth: "none" }}>
        Your account is free. The agency owner manages the subscription.
      </p>
    </div>
  );
}

export default function InvitePage() {
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
        <Suspense fallback={<p style={{ color: "var(--rc-muted)" }}>Loading…</p>}>
          <InviteContent />
        </Suspense>
      </div>
    </div>
  );
}
