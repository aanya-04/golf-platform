import { prisma } from "@/lib/prisma/client";
import { stripe, STRIPE_PLANS } from "@/lib/stripe/client";
import { NotFoundError } from "@/lib/utils/errors";
import type { Prisma, Subscription } from "@prisma/client";
import type Stripe from "stripe";

type SubscriptionPlan = "monthly" | "yearly";

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const existing = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (existing) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({ email, name, metadata: { userId } });

  await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
      status: "inactive",
    },
  });

  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  name: string,
  plan: SubscriptionPlan,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId, email, name);
  const priceId = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, plan },
    subscription_data: {
      metadata: { userId, plan },
    },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  return session.url;
}

export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (!subscription) throw new NotFoundError("Subscription");

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({ where: { userId } });
}

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as SubscriptionPlan | undefined;
      const stripeSubscriptionId = session.subscription as string;

      if (!userId || !plan) break;

      const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      await prisma.subscription.update({
        where: { userId },
        data: {
          stripeSubscriptionId,
          stripePriceId: stripeSub.items.data[0]?.price.id,
          plan,
          status: "active",
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : (invoice.subscription as Stripe.Subscription | null)?.id;
      if (!subId) break;

      const stripeSub = await stripe.subscriptions.retrieve(subId);
      const userId = stripeSub.metadata["userId"];
      if (!userId) break;

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: "active",
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : (invoice.subscription as Stripe.Subscription | null)?.id;
      if (!subId) break;

      const stripeSub = await stripe.subscriptions.retrieve(subId);
      const userId = stripeSub.metadata["userId"];
      if (!userId) break;

      await prisma.subscription.update({
        where: { userId },
        data: { status: "past_due" },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription;
      const userId = stripeSub.metadata["userId"];
      if (!userId) break;

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          stripeSubscriptionId: null,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const stripeSub = event.data.object as Stripe.Subscription;
      const userId = stripeSub.metadata["userId"];
      if (!userId) break;

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: stripeSub.status as Subscription["status"],
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      });
      break;
    }

    default:
      break;
  }
}
