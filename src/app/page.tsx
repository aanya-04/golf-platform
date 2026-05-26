"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, Heart, Target, ArrowRight, Check,
  Star, Users, TrendingUp, Shield, Zap, ChevronDown,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stats = [
  { value: "2,400+", label: "Active Members", icon: Users },
  { value: "£48,000+", label: "Donated to Charity", icon: Heart },
  { value: "£3,200", label: "Prize Pool This Month", icon: Trophy },
  { value: "98%", label: "Member Satisfaction", icon: Star },
];

const features = [
  {
    icon: Target,
    title: "Track Your Scores",
    description: "Log your latest Stableford scores after each round. We keep your best 5 and automatically remove the oldest when you add a new one.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    icon: Trophy,
    title: "Win Monthly Draws",
    description: "Match 3, 4, or 5 numbers to win. Jackpots roll over to next month if unclaimed — meaning the longer you play, the bigger it gets.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    icon: Heart,
    title: "Support Charity",
    description: "At least 10% of every subscription goes directly to your chosen charity. Increase your percentage anytime — every pound counts.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    gradient: "from-purple-500/20 to-purple-600/5",
  },
];

const tiers = [
  { match: "5-Number Match", share: "40%", note: "Jackpot — rolls over if unclaimed", icon: "🏆", color: "from-amber-400 to-yellow-300" },
  { match: "4-Number Match", share: "35%", note: "Split equally among all winners", icon: "🥈", color: "from-slate-400 to-slate-300" },
  { match: "3-Number Match", share: "25%", note: "Split equally among all winners", icon: "🥉", color: "from-orange-400 to-orange-300" },
];

const testimonials = [
  { name: "James H.", role: "Subscriber since Jan 2026", quote: "Won £240 in March and gave an extra 5% to Macmillan. Never felt better about a subscription.", avatar: "JH" },
  { name: "Sarah M.", role: "Subscriber since Feb 2026", quote: "The score tracking is so clean. Finally a golf app that doesn't look like it was built in 2004.", avatar: "SM" },
  { name: "David K.", role: "Subscriber since Mar 2026", quote: "Matched 4 numbers last month. The jackpot rollover feature is genuinely exciting.", avatar: "DK" },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shine">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">GreenDraw</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 glass rounded-full px-4 py-2">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild className="rounded-full gradient-brand text-white border-0 hover:opacity-90">
            <Link href="/signup">Get started free</Link>
          </Button>
        </div>
        <div className="sm:hidden flex gap-2">
          <Button variant="ghost" size="sm" asChild><Link href="/login">Sign in</Link></Button>
          <Button size="sm" asChild><Link href="/signup">Join</Link></Button>
        </div>
      </motion.nav>

      {/* Hero */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center animated-gradient-bg overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl float" style={{ animationDelay: "4s" }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24"
        >
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <Badge className="mb-6 glass text-white border-white/20 px-4 py-1.5 text-sm">
              <Heart className="h-3.5 w-3.5 mr-1.5 text-pink-400" />
              Supporting charities across the UK — 2026
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-5xl sm:text-7xl lg:text-8xl font-black leading-none mb-6 text-white"
          >
            Golf.{" "}
            <span className="relative">
              <span className="text-gradient-gold">Charity.</span>
            </span>
            {" "}Win.
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="text-xl sm:text-2xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track your Stableford scores, enter monthly prize draws, and automatically
            support the charities that matter to you — all in one place.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="rounded-full px-8 py-6 text-lg gradient-brand text-white border-0 hover:opacity-90 glow-green shine">
              <Link href="/signup">
                Start for £9.99/month <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8 py-6 text-lg glass text-white border-white/20 hover:bg-white/10">
              <Link href="/login">Sign in</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="mt-12 flex flex-wrap items-center justify-center gap-6"
          >
            {["No setup fees", "Cancel anytime", "Charity impact guaranteed", "Instant activation"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-white/60 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {f}
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <stat.icon className="h-5 w-5 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-1"
        >
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </div>

      {/* How it works */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1">How it works</Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Three steps to{" "}
              <span className="text-gradient-brand">making a difference</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Simple enough to set up in 2 minutes. Rewarding enough to keep you coming back every month.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-3xl border bg-card p-8 overflow-hidden card-hover cursor-default"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`h-14 w-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className={`h-7 w-7 ${f.color}`} />
                  </div>
                  <div className="text-5xl font-black text-muted-foreground/20 mb-2">0{i + 1}</div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize pool */}
      <section className="py-32 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1">Prize structure</Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="text-gradient-gold">60%</span> of every subscription
              <br />goes into the prize pool
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Distributed every month across three match tiers. The jackpot keeps growing until someone wins.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.match}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ scale: 1.04 }}
                className="relative rounded-3xl border bg-card p-8 text-center overflow-hidden group card-hover"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tier.color}`} />
                <div className="text-4xl mb-4">{tier.icon}</div>
                <div className={`text-6xl font-black mb-2 bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                  {tier.share}
                </div>
                <p className="font-bold text-lg mb-2">{tier.match}</p>
                <p className="text-sm text-muted-foreground">{tier.note}</p>
              </motion.div>
            ))}
          </div>

          {/* Draw numbers animation */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-muted-foreground mb-6">Example monthly draw numbers</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[7, 14, 22, 31, 38].map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: i * 0.1, bounce: 0.5 }}
                  className="number-ball h-16 w-16 text-xl"
                >
                  {n}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-1">Member stories</Badge>
            <h2 className="text-4xl sm:text-5xl font-black">
              What our members say
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-3xl border bg-card p-8 card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security strip */}
      <section className="py-12 px-6 border-y bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: Shield, label: "Secure payments via Razorpay" },
              { icon: Zap, label: "Instant subscription activation" },
              { icon: Heart, label: "Guaranteed charity contribution" },
              { icon: TrendingUp, label: "Monthly prize draws" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-muted-foreground text-sm">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-40 px-6 animated-gradient-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto text-center text-white"
        >
          <Badge className="glass text-white border-white/20 mb-6 px-4 py-1">
            Limited spots — 2026
          </Badge>
          <h2 className="text-5xl sm:text-6xl font-black mb-6">
            Ready to play,<br />give, and win?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-xl mx-auto">
            Join thousands of golfers making a difference every single month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {["No setup fees", "Cancel anytime", "Charity impact guaranteed"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-white/80 text-sm">
                <Check className="h-4 w-4 text-green-400" />
                {f}
              </div>
            ))}
          </div>
          <Button
            size="lg"
            asChild
            className="rounded-full px-12 py-7 text-xl font-bold bg-white text-gray-900 hover:bg-white/90 glow-green shine"
          >
            <Link href="/signup">
              Get started today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-brand flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">GreenDraw</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 GreenDraw. Built with purpose. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
