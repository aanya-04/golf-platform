"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { Check, Loader2, Zap, Calendar, X } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

const plans = [
  {
    id: "monthly" as const,
    name: "Monthly",
    pricePence: 999,
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "Enter monthly prize draws",
      "Track up to 5 Stableford scores",
      "Choose your charity",
      "10% minimum charity contribution",
    ],
  },
  {
    id: "yearly" as const,
    name: "Yearly",
    pricePence: 9990,
    period: "/year",
    description: "Save ~17% vs monthly",
    badge: "Best value",
    features: [
      "Everything in Monthly",
      "Save over ₹200 per month",
      "Priority draw entry",
      "Annual impact report",
    ],
  },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { subscription, user } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(plan: "monthly" | "yearly") {
    setLoading(plan);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway. Please refresh and try again.");

      // Create order on server
      const res = await fetch("/api/subscriptions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const json = await res.json() as {
        data?: { orderId: string; amount: number; currency: string; keyId: string };
        error?: string;
      };

      if (!res.ok || !json.data) throw new Error(json.error ?? "Failed to create order");

      const { orderId, amount, currency, keyId } = json.data;

      // Open Razorpay modal
      const rzp = new window.Razorpay({
        key: keyId,
        amount: amount * 100,
        currency,
        name: "GreenDraw",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
        order_id: orderId,
        prefill: {
          name: user?.fullName ?? "",
          email: user?.email ?? "",
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => {
            setLoading(null);
            toast.info("Payment cancelled");
          },
        },
        handler: async (response: RazorpayResponse) => {
          // Verify payment on server
          try {
            const verifyRes = await fetch("/api/subscriptions/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                plan,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyJson = await verifyRes.json() as { error?: string };
            if (!verifyRes.ok) throw new Error(verifyJson.error ?? "Verification failed");

            toast.success("Subscription activated! Welcome to GreenDraw.");
            router.push("/dashboard?subscribed=true");
            router.refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment verification failed");
            setLoading(null);
          }
        },
      });

      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function handleCancel() {
    setLoading("cancel");
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel");
      toast.success("Subscription will cancel at period end");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setLoading(null);
    }
  }

  const isActive = subscription?.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold">Your Subscription</h1>
        <p className="text-muted-foreground mt-2">Subscribe to play, win, and give back.</p>
      </div>

      {/* Active subscription card */}
      {isActive && subscription && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">
                  {subscription.plan?.charAt(0).toUpperCase()}{subscription.plan?.slice(1)} plan — Active
                </p>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    Renews {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleCancel()}
              disabled={loading === "cancel"}
              className="text-destructive border-destructive/30 hover:bg-destructive/5 shrink-0"
            >
              {loading === "cancel"
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <X className="h-4 w-4 mr-2" />}
              Cancel subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plans — shown when not active */}
      {!isActive && (
        <div className="grid sm:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-shadow hover:shadow-lg ${
                plan.badge ? "border-primary shadow-md" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gradient-brand text-white border-0 px-3">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
                <div className="mt-2">
                  <span className="text-4xl font-bold">
                    {formatCurrency(plan.pricePence)}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.badge ? "default" : "outline"}
                  onClick={() => void handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Get started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* How payment works */}
      <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Secure payment via Razorpay</p>
        <p>
          Payments are processed securely by Razorpay. We never store your card details.
          You can cancel at any time from this page.
        </p>
      </div>
    </motion.div>
  );
}
