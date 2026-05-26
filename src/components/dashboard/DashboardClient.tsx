"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy, Target, Heart, CreditCard,
  Calendar, ChevronRight, Star, Zap, ArrowUpRight,
} from "lucide-react";

type Props = {
  user: { id: string; fullName: string; charityPercentage: number };
  scores: { id: string; score: number; scoreDate: Date; entryOrder: number }[];
  subscription: { status: string; plan: string; currentPeriodEnd: Date | null } | null;
  recentDraws: {
    id: string; monthKey: string; status: string;
    drawResult: { number1: number; number2: number; number3: number; number4: number; number5: number } | null;
    prizePool: { totalPence: number } | null;
  }[];
  winnings: {
    id: string; matchTier: number; prizeAmountPence: number;
    payoutStatus: string; draw: { monthKey: string };
  }[];
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function DashboardClient({ user, scores, subscription, recentDraws, winnings }: Props) {
  const isActive = subscription?.status === "active";
  const totalWon = winnings.reduce((s, w) => s + w.prizeAmountPence, 0);
  const firstName = user.fullName.split(" ")[0];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">{greeting()}</p>
          <h1 className="text-3xl font-black">{firstName} 👋</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">2026</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      </motion.div>

      {/* Subscription CTA */}
      {!isActive && (
        <motion.div variants={item}>
          <div className="relative rounded-3xl animated-gradient-bg p-8 text-white overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <Badge className="glass text-white border-white/20 mb-3">Get started</Badge>
                <p className="text-2xl font-black mb-1">Unlock the full experience</p>
                <p className="text-white/70">Subscribe to enter monthly draws and support charity</p>
              </div>
              <Button asChild size="lg" className="rounded-2xl bg-white text-gray-900 hover:bg-white/90 shrink-0 font-bold px-8">
                <Link href="/subscription">View plans <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Subscription",
            value: isActive ? subscription!.plan.charAt(0).toUpperCase() + subscription!.plan.slice(1) : "Inactive",
            sub: isActive && subscription?.currentPeriodEnd ? `Renews ${formatDate(subscription.currentPeriodEnd)}` : "No active plan",
            icon: CreditCard,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-500/10",
            accent: isActive ? "border-t-2 border-t-primary" : "",
          },
          {
            label: "Scores",
            value: `${scores.length} / 5`,
            sub: scores.length > 0 ? `Latest: ${scores[0]?.score ?? "—"} pts` : "No scores yet",
            icon: Target,
            iconColor: "text-cyan-500",
            iconBg: "bg-cyan-500/10",
            accent: scores.length >= 3 ? "border-t-2 border-t-cyan-500" : "",
          },
          {
            label: "Total Won",
            value: formatCurrency(totalWon),
            sub: `${winnings.length} prize${winnings.length !== 1 ? "s" : ""}`,
            icon: Trophy,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/10",
            accent: totalWon > 0 ? "border-t-2 border-t-amber-500" : "",
          },
          {
            label: "Charity",
            value: `${user.charityPercentage}%`,
            sub: "Of your subscription",
            icon: Heart,
            iconColor: "text-purple-500",
            iconBg: "bg-purple-500/10",
            accent: "border-t-2 border-t-purple-500",
          },
        ].map((s) => (
          <Card key={s.label} className={`card-hover ${s.accent}`}>
            <CardContent className="p-5">
              <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-black mb-0.5">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scores */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-cyan-500" />
                </div>
                My Scores
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-xs rounded-full">
                <Link href="/scores">Manage <ChevronRight className="h-3 w-3 ml-0.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {scores.length === 0 ? (
                <div className="text-center py-10">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Target className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No scores yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Add your first Stableford score</p>
                  <Button size="sm" asChild className="rounded-full"><Link href="/scores">Add score</Link></Button>
                </div>
              ) : (
                scores.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between rounded-2xl bg-muted/50 hover:bg-muted transition-colors px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4 font-medium">{i + 1}</span>
                      <span className="text-sm">{formatDate(s.scoreDate)}</span>
                      {i === 0 && <Badge className="text-xs py-0 px-2 bg-primary/10 text-primary border-0">Latest</Badge>}
                    </div>
                    <div className="h-8 w-8 rounded-xl gradient-brand-soft flex items-center justify-center">
                      <span className="text-sm font-black text-primary">{s.score}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Draws */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                Recent Draws
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-xs rounded-full">
                <Link href="/draws">All draws <ChevronRight className="h-3 w-3 ml-0.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDraws.length === 0 ? (
                <div className="text-center py-10">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No draws yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back at month end</p>
                </div>
              ) : (
                recentDraws.map((draw, i) => (
                  <motion.div
                    key={draw.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={`/draws/${draw.id}`}
                      className="flex items-center justify-between rounded-2xl bg-muted/50 hover:bg-muted transition-colors px-4 py-3 group"
                    >
                      <div>
                        <p className="text-sm font-semibold">{draw.monthKey}</p>
                        {draw.drawResult && (
                          <div className="flex gap-1.5 mt-1.5">
                            {[draw.drawResult.number1, draw.drawResult.number2, draw.drawResult.number3, draw.drawResult.number4, draw.drawResult.number5].map((n, j) => (
                              <span key={j} className="number-ball h-5 w-5 text-xs">{n}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {draw.prizePool && (
                          <span className="text-sm font-black text-primary">{formatCurrency(draw.prizePool.totalPence)}</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Winnings */}
      {winnings.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-t-2 border-t-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-500" />
                </div>
                Prize Winnings
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-xs rounded-full">
                <Link href="/winnings">View all <ChevronRight className="h-3 w-3 ml-0.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {winnings.slice(0, 3).map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200/50 dark:border-amber-800/30 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                      {w.matchTier}-match
                    </Badge>
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(w.prizeAmountPence)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{w.draw.monthKey}</p>
                  <Badge
                    variant="secondary"
                    className={`text-xs mt-2 ${
                      w.payoutStatus === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : w.payoutStatus === "verified" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {w.payoutStatus}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
