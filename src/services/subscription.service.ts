import { prisma } from "@/lib/prisma/client";
import { razorpay, RAZORPAY_PLANS } from "@/lib/razorpay/client";
import { verifyRazorpayPayment, verifyRazorpayWebhook } from "@/lib/razorpay/verify";
import { NotFoundError } from "@/lib/utils/errors";
import type { Subscription } from "@prisma/client";

export type SubscriptionPlan = "monthly" | "yearly";

// ─── Get or create subscription record ───────────────────────────

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function getOrCreateSubscriptionRecord(userId: string): Promise<Subscription> {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.subscription.create({
    data: { userId, status: "inactive" },
  });
}

// ─── Create Razorpay Order ────────────────────────────────────────
// Razorpay flow:
// 1. Server creates an Order (amount in paise)
// 2. Client opens Razorpay checkout modal with the order_id
// 3. User pays → Razorpay calls our webhook OR client sends payment_id + signature
// 4. We verify signature and activate subscription

export async function createOrder(
  userId: string,
  plan: SubscriptionPlan
): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  await getOrCreateSubscriptionRecord(userId);

  const planConfig = RAZORPAY_PLANS[plan];

  const order = await razorpay.orders.create({
    amount: planConfig.amount * 100, // Razorpay uses paise (100 paise = ₹1) or smallest unit
    currency: "INR",
    receipt: `sub_${userId.slice(0, 8)}_${Date.now()}`,
    notes: { userId, plan },
  });

  return {
    orderId: order.id,
    amount: planConfig.amount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}

// ─── Verify payment & activate subscription ───────────────────────

export async function verifyAndActivate(
  userId: string,
  plan: SubscriptionPlan,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<Subscription> {
  // Verify the payment signature
  const isValid = verifyRazorpayPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    throw new Error("Payment verification failed — invalid signature");
  }

  const now = new Date();
  const planConfig = RAZORPAY_PLANS[plan];

  // Calculate period end based on plan
  const periodEnd = new Date(now);
  if (plan === "monthly") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      razorpaySubscriptionId: razorpayPaymentId,
      plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    update: {
      razorpaySubscriptionId: razorpayPaymentId,
      plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelledAt: null,
      cancelAtPeriodEnd: false,
    },
  });

  return subscription;
}

// ─── Cancel subscription ──────────────────────────────────────────

export async function cancelSubscription(userId: string): Promise<Subscription> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw new NotFoundError("Subscription");

  return prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
      cancelledAt: new Date(),
    },
  });
}

// ─── Webhook handler ──────────────────────────────────────────────
// Razorpay sends webhook events for payment.captured, subscription.activated, etc.

export async function handleRazorpayWebhook(
  rawBody: string,
  signature: string
): Promise<void> {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const isValid = verifyRazorpayWebhook(rawBody, signature, secret);

  if (!isValid) {
    throw new Error("Invalid webhook signature");
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: {
      payment?: { entity: { id: string; notes: { userId?: string; plan?: string }; created_at: number } };
      subscription?: { entity: { id: string; status: string; notes: { userId?: string }; current_end: number } };
    };
  };

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment?.entity;
      if (!payment) break;

      const userId = payment.notes.userId;
      const plan = payment.notes.plan as SubscriptionPlan | undefined;
      if (!userId || !plan) break;

      const now = new Date(payment.created_at * 1000);
      const periodEnd = new Date(now);
      if (plan === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          razorpaySubscriptionId: payment.id,
          plan,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        update: {
          razorpaySubscriptionId: payment.id,
          plan,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
      break;
    }

    case "subscription.cancelled": {
      const sub = event.payload.subscription?.entity;
      if (!sub) break;

      const userId = sub.notes.userId;
      if (!userId) break;

      await prisma.subscription.updateMany({
        where: { userId },
        data: { status: "cancelled", cancelledAt: new Date() },
      });
      break;
    }

    case "subscription.charged": {
      const sub = event.payload.subscription?.entity;
      if (!sub) break;

      const userId = sub.notes.userId;
      if (!userId) break;

      await prisma.subscription.updateMany({
        where: { userId },
        data: {
          status: "active",
          currentPeriodEnd: new Date(sub.current_end * 1000),
        },
      });
      break;
    }

    default:
      break;
  }
}
