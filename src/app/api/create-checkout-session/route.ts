import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  essentials: "price_1TvuRBEGKrM2hd0SlE7XjBmj",
  standard: "price_1TvuRfEGKrM2hd0SolYypGz6",
  professional: "price_1TvuSBEGKrM2hd0S6GjA3zJT",
};

export async function POST(req: NextRequest) {
  const { email, agency, plan } = await req.json();

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { email, agency, plan },
    success_url: `${baseUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/signup`,
  });

  return NextResponse.json({ url: session.url });
}
