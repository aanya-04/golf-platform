import { prisma } from "@/lib/prisma/client";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Heart, DollarSign } from "lucide-react";

export default async function AdminPage() {
  const [
    totalUsers,
    activeSubscriptions,
    totalDraws,
    pendingWinners,
    totalCharityPence,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.draw.count(),
    prisma.winner.count({ where: { payoutStatus: "pending" } }),
    prisma.charityContribution.aggregate({ _sum: { amountPence: true } }),
  ]);

  const stats = [
    { label: "Total users", value: totalUsers.toString(), icon: Users, color: "text-blue-500" },
    { label: "Active subscribers", value: activeSubscriptions.toString(), icon: DollarSign, color: "text-green-500" },
    { label: "Draws run", value: totalDraws.toString(), icon: Trophy, color: "text-amber-500" },
    {
      label: "Charity donated",
      value: formatCurrency(totalCharityPence._sum.amountPence ?? 0),
      icon: Heart,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {s.label}
                </p>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingWinners > 0 && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            ⚠️ {pendingWinners} winner{pendingWinners !== 1 ? "s" : ""} awaiting proof verification
          </p>
        </div>
      )}
    </div>
  );
}
