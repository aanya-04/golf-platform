import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/auth.service";
import { getUserScores } from "@/services/score.service";
import { getUserSubscription } from "@/services/subscription.service";
import { getPublishedDraws } from "@/services/draw.service";
import { getWinnersByUser } from "@/services/winner.service";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) redirect("/login");

  const [scores, subscription, draws, winnings] = await Promise.all([
    getUserScores(user.id),
    getUserSubscription(user.id),
    getPublishedDraws(1, 3),
    getWinnersByUser(user.id),
  ]);

  return (
    <DashboardClient
      user={user}
      scores={scores}
      subscription={subscription}
      recentDraws={draws.draws}
      winnings={winnings}
    />
  );
}
