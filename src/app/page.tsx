import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Heart, Target, ArrowRight, Check } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-lg">GreenDraw</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
          <Button asChild><Link href="/signup">Get started</Link></Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-6">
          <Heart className="h-3.5 w-3.5" />
          Supporting charities across the UK
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
          Golf. Charity.{" "}
          <span className="text-gradient-brand">Win.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Track your Stableford scores, enter monthly prize draws, and automatically
          support the charities that matter to you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="px-8">
            <Link href="/signup">
              Start for £9.99/month <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Enter your scores", description: "Log your latest Stableford scores after each round. We keep your best 5.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
              { icon: Trophy, title: "Win monthly draws", description: "Match 3, 4, or 5 numbers to win. Jackpots roll over if unclaimed.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
              { icon: Heart, title: "Support charity", description: "At least 10% of your subscription goes directly to your chosen charity.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
            ].map((step) => (
              <div key={step.title} className={`rounded-2xl p-8 ${step.bg}`}>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${step.bg}`}>
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize pool */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Prize Pool Breakdown</h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            60% of every subscription goes into the prize pool, distributed monthly.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { label: "5-number match", share: "40%", note: "Jackpot — rolls over if unclaimed" },
              { label: "4-number match", share: "35%", note: "Split among all winners" },
              { label: "3-number match", share: "25%", note: "Split among all winners" },
            ].map((tier) => (
              <div key={tier.label} className="rounded-2xl border bg-card p-6">
                <p className="text-4xl font-bold text-primary mb-2">{tier.share}</p>
                <p className="font-semibold mb-1">{tier.label}</p>
                <p className="text-xs text-muted-foreground">{tier.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-brand py-24 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Ready to play?</h2>
          <p className="text-white/80 mb-8 text-lg">
            Join thousands of golfers making a difference every month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {["No setup fees", "Cancel anytime", "Charity impact guaranteed"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-white/90">
                <Check className="h-4 w-4" /> {f}
              </div>
            ))}
          </div>
          <Button size="lg" variant="secondary" asChild className="px-10">
            <Link href="/signup">Get started today</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2025 GreenDraw. Built with purpose.
      </footer>
    </div>
  );
}
