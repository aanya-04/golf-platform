"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy, Target, Heart, CreditCard,
  Calendar, ChevronRight, Star,
} from "lucide-react";

type Props = {
  user: { id: string; fullName: string; charityPercentage: number };
  scores: { id: string; score: number; scoreDate: Date; entryOrder: number }[];
  subscription: {
    status: string; plan: string; currentPeriodEnd: Date | null;
  } | null;
  recentDraws: {
    id: string; monthKey: string; status: string;
    drawResult: { number1: number; number2: number; number3: number; number4: number; number5: number } | null;
    prizePool: { totalPence: number } | null;
  }[];
  winnings: {
    id: string; matchTier: number; prizeAmountPence: number;
    payoutStatus: string;
    draw: { monthKey: string };
  }[];
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function DashboardClient({ user, scores, subscription, recentDraws, winnings }: Props) {
  const isActive = subscription?.status === "active";
  const totalWon = winnings.reduce((sum, w) => sum + w.prizeAmountPence, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold">
          Good to see you, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s everything happening with your account.
        </p>
      </motion.div>

      {/* Subscription banner if inactive */}
      {!isActive && (
        <motion.div variants={itemVariants}>
          <div className="rounded-xl gradient-brand p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">Start your subscription</p>
              <p className="text-white/80 text-sm mt-1">
                Subscribe to enter monthly draws and support charity
              </p>
            </div>
            <Button variant="secondary" asChild className="shrink-0">
              <Link href="/subscription">View plans</Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Subscription",
            value: isActive ? subscription!.plan.charAt(0).toUpperCase() + subscription!.plan.slice(1) : "Inactive",
            sub: isActive && subscription?.currentPeriodEnd
              ? `Renews ${formatDate(subscription.currentPeriodEnd)}`
              : "No active plan",
            icon: CreditCard,
            color: isActive ? "text-primary" : "text-muted-foreground",
          },
          {
            label: "Scores entered",
            value: `${scores.length}/5`,
            sub: scores.length > 0 ? `Latest: ${scores[0]?.score ?? "-"}` : "No scores yet",
            icon: Target,
            color: "text-blue-500",
          },
          {
            label: "Total won",
            value: formatCurrency(totalWon),
            sub: `${winnings.length} prize${winnings.length !== 1 ? "s" : ""}`,
            icon: Trophy,
            color: "text-amber-500",
          },
          {
            label: "Charity support",
            value: `${user.charityPercentage}%`,
            sub: "Of subscription",
            icon: Heart,
            color: "text-purple-500",
          },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Scores */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Your Scores
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/scores" className="flex items-center gap-1 text-xs">
                  Manage <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {scores.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No scores yet</p>
                  <Button size="sm" className="mt-3" asChild>
                    <Link href="/scores">Add your first score</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {scores.map((s, i) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                        <span className="text-sm font-medium">{formatDate(s.scoreDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{s.score}</span>
                        {i === 0 && (
                          <Badge variant="secondary" className="text-xs py-0">Latest</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Draws */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Recent Draws
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/draws" className="flex items-center gap-1 text-xs">
                  All draws <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentDraws.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No draws published yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDraws.map((draw) => (
                    <Link
                      key={draw.id}
                      href={`/draws/${draw.id}`}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-3 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{draw.monthKey}</p>
                        {draw.drawResult && (
                          <div className="flex gap-1 mt-1">
                            {[draw.drawResult.number1, draw.drawResult.number2, draw.drawResult.number3, draw.drawResult.number4, draw.drawResult.number5].map((n, i) => (
                              <span
                                key={i}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {draw.prizePool && (
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(draw.prizePool.totalPence)}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Winnings */}
      {winnings.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                My Winnings
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/winnings" className="flex items-center gap-1 text-xs">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {winnings.slice(0, 3).map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-950/20 px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{w.draw.monthKey} — {w.matchTier}-number match</p>
                      <Badge
                        variant="secondary"
                        className={`text-xs mt-1 ${
                          w.payoutStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : w.payoutStatus === "verified"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {w.payoutStatus}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-amber-600">
                      {formatCurrency(w.prizeAmountPence)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
