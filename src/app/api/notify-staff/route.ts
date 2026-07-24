import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

export async function POST(req: NextRequest) {
  const { email, orgOwnerId, type, title, message } = await req.json();
  if (!email || !orgOwnerId || !title || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Try to find the matching auth user by email
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const matched = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  await supabaseAdmin.from("notifications").insert({
    user_id: matched?.id ?? null,
    recipient_email: email.toLowerCase(),
    org_owner_id: orgOwnerId,
    type: type ?? "general",
    title,
    message,
    read: false,
  });

  return NextResponse.json({ sent: true, matched: !!matched });
}
