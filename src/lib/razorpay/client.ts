import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const RAZORPAY_PLANS = {
  monthly: {
    amount: Number(process.env.MONTHLY_PRICE_PENCE ?? 999),
    period: "monthly" as const,
    interval: 1,
  },
  yearly: {
    amount: Number(process.env.YEARLY_PRICE_PENCE ?? 9990),
    period: "yearly" as const,
    interval: 1,
  },
} as const;

export type RazorpayPlan = keyof typeof RAZORPAY_PLANS;
