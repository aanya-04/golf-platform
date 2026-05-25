import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/auth.service";
import { getWinnersByUser } from "@/services/winner.service";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export const metadata: Metadata = { title: "My Winnings" };

export default async function WinningsPage() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user) redirect("/login");

  const winnings = await getWinnersByUser(user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Winnings</h1>
      {winnings.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No winnings yet. Keep playing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {winnings.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{w.draw.monthKey} — {w.matchTier}-number match</p>
                  <Badge variant="secondary" className="mt-1 text-xs">{w.payoutStatus}</Badge>
                </div>
                <p className="text-xl font-bold text-primary">{formatCurrency(w.prizeAmountPence)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
