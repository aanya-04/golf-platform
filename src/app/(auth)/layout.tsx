import { Trophy } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 gradient-brand text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold">GreenDraw</span>
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "Play golf. Support charity. Win prizes. Every month."
          </blockquote>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Active Members", value: "2,400+" },
              { label: "Donated to Charity", value: "£48,000+" },
              { label: "Prize Pool This Month", value: "£3,200" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 p-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/50 text-sm">© 2025 GreenDraw. All rights reserved.</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">GreenDraw</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
