import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(secret, {
    apiVersion: "2025-11-17.clover",
  });
}

const priceMap: Record<string, string> = {
  FOUNDING_MONTHLY: process.env.STRIPE_PRICE_FOUNDING_MONTHLY ?? "",
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
};

export async function POST(req: Request) {
  const form = await req.formData();
  const planRaw = form.get("plan");
  const plan = typeof planRaw === "string" ? planRaw : planRaw?.toString() ?? "";

  const priceId = priceMap[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin =
    req.headers.get("origin") ??
    `https://${req.headers.get("host") ?? "localhost"}`;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe session created without URL" },
        { status: 500 },
      );
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Stripe checkout creation failed" },
      { status: 500 },
    );
  }
}
