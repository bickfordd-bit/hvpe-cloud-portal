import { Buffer } from 'node:buffer';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(secret, {
    apiVersion: '2025-11-17.clover',
  });
}
const LICENSE_ACTIVATION_URL = process.env.LICENSE_ACTIVATION_URL;
const LICENSE_ACTIVATION_TOKEN = process.env.LICENSE_ACTIVATION_TOKEN;

async function buffer(req: Request): Promise<Buffer> {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') ?? '';
  const rawBody = await buffer(req);

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err: unknown) {
    console.error('⚠️  Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail = session.customer_details?.email ?? 'unknown';
    const planMeta = session.metadata?.plan ?? 'UNKNOWN';

    console.log('Checkout completed:', customerEmail, planMeta);

    if (LICENSE_ACTIVATION_URL && customerEmail) {
      try {
        await fetch(LICENSE_ACTIVATION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(LICENSE_ACTIVATION_TOKEN
              ? { Authorization: `Bearer ${LICENSE_ACTIVATION_TOKEN}` }
              : {}),
          },
          body: JSON.stringify({
            email: customerEmail,
            plan: planMeta,
            stripe_session: session.id,
          }),
        });
      } catch (err: unknown) {
        console.warn('License activation webhook call failed', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
