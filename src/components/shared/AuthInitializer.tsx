"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";

type Props = {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    role: "subscriber" | "admin";
    charityPercentage: number;
    selectedCharityId: string | null;
  };
  subscription: {
    status: "active" | "inactive" | "cancelled" | "past_due" | "trialing";
    plan: "monthly" | "yearly";
    currentPeriodEnd: Date | null;
  } | null;
};

export function AuthInitializer({ user, subscription }: Props) {
  const { setUser, setSubscription, setLoading } = useAuthStore();

  useEffect(() => {
    setUser(user);
    setSubscription(
      subscription
        ? {
            status: subscription.status,
            plan: subscription.plan,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
          }
        : null
    );
    setLoading(false);
  }, [user, subscription, setUser, setSubscription, setLoading]);

  return null;
}
