import { handleRazorpayWebhook } from "@/services/subscription.service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    await handleRazorpayWebhook(rawBody, signature);
    return Response.json({ received: true });
  } catch (err) {
    console.error("[Razorpay Webhook] Error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
