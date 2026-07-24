import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { email, agency, abn, plan } = session.metadata ?? {};

    if (email && session.subscription) {
      // Look up user by email
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.users.find((u) => u.email === email);

      if (user) {
        // Record subscription
        await supabaseAdmin.from("subscriptions").upsert({
          user_id: user.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan,
          agency,
          status: "active",
          created_at: new Date().toISOString(),
        });

        // Create organisation record (one per ABN)
        if (abn) {
          await supabaseAdmin.from("organisations").upsert(
            { abn, agency_name: agency ?? "", owner_user_id: user.id },
            { onConflict: "abn" }
          );
        }
      }
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const parentSub = invoice.parent?.subscription_details?.subscription;
    const subId = typeof parentSub === "string" ? parentSub : parentSub?.id;
    if (subId) {
      await supabaseAdmin.from("subscriptions").update({ status: "past_due" }).eq("stripe_subscription_id", subId);
      const { data: sub } = await supabaseAdmin.from("subscriptions").select("user_id").eq("stripe_subscription_id", subId).maybeSingle();
      if (sub?.user_id) {
        await supabaseAdmin.from("organisations")
          .update({ status: "suspended", suspended_at: new Date().toISOString() })
          .eq("owner_user_id", sub.user_id)
          .is("suspended_at", null);
      }
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const parentSub = invoice.parent?.subscription_details?.subscription;
    const subId = typeof parentSub === "string" ? parentSub : parentSub?.id;
    if (subId) {
      await supabaseAdmin.from("subscriptions").update({ status: "active" }).eq("stripe_subscription_id", subId);
      const { data: sub } = await supabaseAdmin.from("subscriptions").select("user_id").eq("stripe_subscription_id", subId).maybeSingle();
      if (sub?.user_id) {
        await supabaseAdmin.from("organisations")
          .update({ status: "active", suspended_at: null })
          .eq("owner_user_id", sub.user_id);
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await supabaseAdmin.from("subscriptions").update({ status: "cancelled" }).eq("stripe_subscription_id", sub.id);
    const { data: subRecord } = await supabaseAdmin.from("subscriptions").select("user_id").eq("stripe_subscription_id", sub.id).maybeSingle();
    if (subRecord?.user_id) {
      await supabaseAdmin.from("organisations")
        .update({ status: "suspended", suspended_at: new Date().toISOString() })
        .eq("owner_user_id", subRecord.user_id)
        .is("suspended_at", null);
    }
  }

  return NextResponse.json({ received: true });
}
