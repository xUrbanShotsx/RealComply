import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

export async function POST(req: NextRequest) {
  const { token, email } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("invites")
    .update({ accepted_at: new Date().toISOString(), email: email ?? null })
    .eq("token", token)
    .is("accepted_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
