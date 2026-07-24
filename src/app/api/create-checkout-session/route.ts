import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

const PRICE_IDS: Record<string, string> = {
  small:        "price_1TwX7iEGKrM2hd0S7yZn9l47",  // AUD $99/mo
  medium:       "price_1TwX7xEGKrM2hd0SufHWLpTM",  // AUD $189/mo
  large:        "price_1TwX8GEGKrM2hd0SwDKs3Q2a",  // AUD $349/mo
  // Legacy — keep until old subscribers are migrated
  essentials:   "price_1TvuRBEGKrM2hd0SlE7XjBmj",
  standard:     "price_1TvuRfEGKrM2hd0SolYypGz6",
  professional: "price_1TvuSBEGKrM2hd0S6GjA3zJT",
};

export async function POST(req: NextRequest) {
  const { email, agency, abn, plan } = await req.json();

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Enforce one organisation per ABN
  if (abn) {
    const { data: existing } = await supabaseAdmin
      .from("organisations")
      .select("id")
      .eq("abn", abn)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: "An organisation with this ABN already exists. If you're a staff member, ask your agency owner for an invite link." },
        { status: 409 }
      );
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    metadata: { email, agency, abn: abn ?? "", plan },
    success_url: `${baseUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/signup`,
  });

  return NextResponse.json({ url: session.url });
}
