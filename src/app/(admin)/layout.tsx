import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/auth.service";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { AuthInitializer } from "@/components/shared/AuthInitializer";
import Link from "next/link";
import { Trophy, Users, BarChart3, Heart, Medal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const adminNav = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/draws", label: "Draws", icon: Trophy },
  { href: "/admin/charities", label: "Charities", icon: Heart },
  { href: "/admin/winners", label: "Winners", icon: Medal },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) redirect("/login");

  const user = await getUserBySupabaseId(supabaseUser.id);
  if (!user || user.role !== "admin") redirect("/dashboard");

  return (
    <QueryProvider>
      <AuthInitializer user={user} subscription={null} />
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-56 border-r bg-card hidden md:flex flex-col">
          <div className="p-4 border-b">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg gradient-brand flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm">Admin</span>
            </Link>
          </div>
          <nav className="p-3 flex-1 space-y-1">
            {adminNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Back to app
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </QueryProvider>
  );
}
