import { prisma } from "@/lib/prisma/client";
import { razorpay } from "@/lib/razorpay/client";
import { verifyRazorpayPayment, verifyRazorpayWebhook } from "@/lib/razorpay/verify";
import { NotFoundError } from "@/lib/utils/errors";
import type { Subscription } from "@prisma/client";

export type SubscriptionPlan = "monthly" | "yearly";

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

export async function createOrder(
  userId: string,
  plan: SubscriptionPlan
): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
  await getOrCreateSubscriptionRecord(userId);

  const amounts: Record<SubscriptionPlan, number> = {
    monthly: Number(process.env.MONTHLY_PRICE_PENCE ?? 999),
    yearly: Number(process.env.YEARLY_PRICE_PENCE ?? 9990),
  };

  const amount = amounts[plan];

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `sub_${userId.slice(0, 8)}_${Date.now()}`,
    notes: { userId, plan },
  });

  return {
    orderId: order.id,
    amount,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}

export async function verifyAndActivate(
  userId: string,
  plan: SubscriptionPlan,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<Subscription> {
  const isValid = verifyRazorpayPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    throw new Error("Payment verification failed — invalid signature");
  }

  const now = new Date();
  const periodEnd = new Date(now);
  if (plan === "monthly") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }

  return prisma.subscription.upsert({
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
}

export async function cancelSubscription(userId: string): Promise<Subscription> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw new NotFoundError("Subscription");

  return prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true, cancelledAt: new Date() },
  });
}

export async function handleRazorpayWebhook(
  rawBody: string,
  signature: string
): Promise<void> {
  const isValid = verifyRazorpayWebhook(
    rawBody,
    signature,
    process.env.RAZORPAY_KEY_SECRET!
  );

  if (!isValid) throw new Error("Invalid webhook signature");

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: {
      payment?: {
        entity: {
          id: string;
          notes: { userId?: string; plan?: string };
          created_at: number;
        };
      };
      subscription?: {
        entity: {
          id: string;
          status: string;
          notes: { userId?: string };
          current_end: number;
        };
      };
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
      if (!sub?.notes.userId) break;
      await prisma.subscription.updateMany({
        where: { userId: sub.notes.userId },
        data: { status: "cancelled", cancelledAt: new Date() },
      });
      break;
    }

    case "subscription.charged": {
      const sub = event.payload.subscription?.entity;
      if (!sub?.notes.userId) break;
      await prisma.subscription.updateMany({
        where: { userId: sub.notes.userId },
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
