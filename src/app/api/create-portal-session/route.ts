import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing record found." }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${baseUrl}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
