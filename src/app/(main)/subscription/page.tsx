"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { Check, Loader2, Zap, Calendar } from "lucide-react";

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
      "Save £2 per month",
      "Priority draw entry",
      "Annual impact report",
    ],
  },
];

export default function SubscriptionPage() {
  const { subscription } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(plan: "monthly" | "yearly") {
    setLoading(plan);
    try {
      const res = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json() as { data?: { url: string }; error?: string };
      if (!res.ok || !json.data?.url) throw new Error(json.error ?? "Failed");
      window.location.href = json.data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading("portal");
    try {
      const res = await fetch("/api/subscriptions/portal", { method: "POST" });
      const json = await res.json() as { data?: { url: string }; error?: string };
      if (!res.ok || !json.data?.url) throw new Error(json.error ?? "Failed");
      window.location.href = json.data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
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
        <p className="text-muted-foreground mt-2">
          Subscribe to play, win, and give back.
        </p>
      </div>

      {/* Current status */}
      {isActive && subscription && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-brand flex items-center justify-center">
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
              onClick={() => void handleManage()}
              disabled={loading === "portal"}
            >
              {loading === "portal" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Manage subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
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
                  {loading === plan.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Get started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
