import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

const PLAN_LIMITS: Record<string, number> = {
  essentials: 20,
  standard: 60,
  professional: 120,
};

export async function POST(req: NextRequest) {
  const { userId, email, agencyName } = await req.json();

  // Get subscription + plan
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const plan = sub?.plan ?? "essentials";
  const limit = PLAN_LIMITS[plan] ?? 20;

  // Count existing staff + accepted invites
  const [{ count: staffCount }, { count: inviteCount }] = await Promise.all([
    supabaseAdmin.from("staff_members").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("invites").select("*", { count: "exact", head: true }).eq("invited_by", userId).not("accepted_at", "is", null),
  ]);

  const used = (staffCount ?? 0) + (inviteCount ?? 0);
  if (used >= limit) {
    return NextResponse.json({ error: `Seat limit reached (${limit} on ${plan} plan). Upgrade to invite more staff.` }, { status: 403 });
  }

  // Create invite token
  const token = crypto.randomUUID();
  const { error } = await supabaseAdmin.from("invites").insert({
    token,
    invited_by: userId,
    email: email || null,
    agency_name: agencyName,
    plan,
    created_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.headers.get("origin") ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl}/signup/invite?token=${token}`;

  return NextResponse.json({ inviteUrl, seatsUsed: used + 1, seatsTotal: limit });
}
