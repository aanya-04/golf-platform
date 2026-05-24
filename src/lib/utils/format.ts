import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatCurrency(amountInPence: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amountInPence / 100);
}

export function formatDate(date: Date | string, pattern = "dd MMM yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatMonthKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM");
}

export function formatScore(score: number): string {
  return score.toString().padStart(2, "0");
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
