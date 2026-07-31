"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (!hash) {
      // Try PKCE flow — Supabase will have already exchanged the code automatically
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setStatus("success");
          setTimeout(() => router.replace("/dashboard"), 1500);
        } else {
          setStatus("error");
          setMessage("No session found. Your link may have expired.");
        }
      });
      return;
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken) {
      setStatus("error");
      setMessage("Invalid confirmation link. Please try signing up again.");
      return;
    }

    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
      if (error) {
        setStatus("error");
        setMessage("Failed to confirm your email. The link may have expired.");
        return;
      }
      setStatus("success");
      // For signup confirmations redirect to dashboard; password recovery goes to reset
      setTimeout(() => router.replace(type === "recovery" ? "/reset-password" : "/dashboard"), 1500);
    });
  }, [router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100svh", background: "#f6f9fc", fontFamily: "system-ui, sans-serif", padding: "24px" }}>
      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        {status === "loading" && (
          <>
            <div style={{ width: "48px", height: "48px", border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>Confirming your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "26px" }}>✓</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", marginBottom: "8px" }}>Email confirmed!</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Taking you to your dashboard…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "26px" }}>✕</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#0f172a", marginBottom: "8px" }}>Confirmation failed</h1>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>{message}</p>
            <a href="/signup" style={{ display: "inline-block", padding: "10px 24px", background: "#6366f1", color: "white", borderRadius: "8px", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}>Back to sign up</a>
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
