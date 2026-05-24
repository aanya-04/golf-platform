import { stripe } from "@/lib/stripe/client";
import { handleStripeWebhook } from "@/services/subscription.service";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleStripeWebhook(event);
    return Response.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

// Stripe requires the raw body — disable body parsing
export const config = { api: { bodyParser: false } };
