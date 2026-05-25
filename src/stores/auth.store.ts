import { create } from "zustand";

type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: "subscriber" | "admin";
  charityPercentage: number;
  selectedCharityId: string | null;
};

type SubscriptionState = {
  status: "active" | "inactive" | "cancelled" | "past_due" | "trialing" | null;
  plan: "monthly" | "yearly" | null;
  currentPeriodEnd: string | null;
};

type AuthStore = {
  user: UserProfile | null;
  subscription: SubscriptionState | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setSubscription: (sub: SubscriptionState | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  subscription: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, subscription: null, isLoading: false }),
}));
