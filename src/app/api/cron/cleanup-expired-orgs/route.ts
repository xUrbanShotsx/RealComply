import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

// Called daily by Vercel Cron. Permanently deletes organisations (and all their data
// via CASCADE) that have been suspended for more than 6 months.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: expired, error: fetchError } = await supabaseAdmin
    .from("organisations")
    .select("id, owner_user_id, agency_name")
    .eq("status", "suspended")
    .lt("suspended_at", sixMonthsAgo.toISOString());

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const ownerIds = expired.map((o) => o.owner_user_id);

  // Delete all org data across tables (cascade from owner_user_id)
  const tables = [
    "staff_members", "properties", "property_checklist_states",
    "marketing_checklists", "marketing_templates", "policies",
    "trust_accounts", "trust_transactions", "aml_checks",
    "complaints_register", "meetings", "risk_register",
    "gift_register", "incident_register", "onboarding_members",
    "calendar_events", "subscriptions",
  ];

  for (const table of tables) {
    await supabaseAdmin.from(table).delete().in("user_id", ownerIds);
  }

  // Finally delete the organisation records
  await supabaseAdmin.from("organisations").delete().in("owner_user_id", ownerIds);

  return NextResponse.json({ deleted: expired.length, orgs: expired.map((o) => o.agency_name) });
}
