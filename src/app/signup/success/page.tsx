"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!sessionId) {
      router.push("/signup");
      return;
    }
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) { clearInterval(interval); router.push("/signin"); }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId, router]);

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
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "var(--rc-primary-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: "32px", color: "var(--rc-primary)",
          }}>
            ✓
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--rc-ink)", letterSpacing: "-0.035em", marginBottom: "12px" }}>
            You&apos;re all set!
          </h1>
          <p style={{ fontSize: "16px", color: "var(--rc-muted)", lineHeight: 1.7, marginBottom: "8px", maxWidth: "none" }}>
            Payment confirmed. Check your email to verify your account, then sign in to access your dashboard.
          </p>
          <p style={{ fontSize: "14px", color: "var(--rc-faint)", marginBottom: "32px", maxWidth: "none" }}>
            Redirecting to sign in in {countdown}s…
          </p>

          <Link
            href="/signin"
            style={{
              display: "inline-block", padding: "13px 32px",
              background: "var(--rc-primary)", color: "white",
              borderRadius: "8px", fontWeight: 700, fontSize: "15px",
            }}
          >
            Sign in now
          </Link>
        </div>
      </div>
    </div>
  );
}
