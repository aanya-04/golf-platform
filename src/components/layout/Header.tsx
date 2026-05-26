"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Trophy, Heart, LogOut,
  Settings, Shield, Menu, X, Target,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scores", label: "Scores", icon: Target },
  { href: "/draws", label: "Draws", icon: Trophy },
  { href: "/charity", label: "Charity", icon: Heart },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, subscription } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = user?.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const isActive = subscription?.status === "active";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-brand shine group-hover:scale-105 transition-transform">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-lg">GreenDraw</span>
        </Link>

        <nav className="hidden md:flex items-center bg-muted/50 rounded-full p-1 gap-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                pathname.startsWith(href)
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isActive ? (
            <Badge className="hidden sm:flex bg-primary/10 text-primary border-primary/20 rounded-full px-3 gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-primary relative">
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
              </div>
              Active
            </Badge>
          ) : (
            <Button size="sm" asChild className="hidden sm:flex rounded-full gradient-brand text-white border-0 hover:opacity-90">
              <Link href="/subscription">Subscribe</Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full ring-2 ring-border hover:ring-primary/50 transition-all focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl ?? ""} />
                  <AvatarFallback className="text-xs gradient-brand text-white font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
              <div className="px-2 py-2 mb-1">
                <p className="text-sm font-semibold truncate">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link href="/profile"><Settings className="mr-2 h-4 w-4" />Settings</Link>
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin Panel</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void handleSignOut()}
                className="text-destructive focus:text-destructive rounded-xl cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="p-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    pathname.startsWith(href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
