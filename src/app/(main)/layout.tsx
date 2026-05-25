import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserBySupabaseId } from "@/services/auth.service";
import { getUserSubscription } from "@/services/subscription.service";
import { Header } from "@/components/layout/Header";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { AuthInitializer } from "@/components/shared/AuthInitializer";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) redirect("/login");

  const [user, subscription] = await Promise.all([
    getUserBySupabaseId(supabaseUser.id),
    null as Awaited<ReturnType<typeof getUserSubscription>> | null,
  ]);

  if (!user) redirect("/login");

  const sub = await getUserSubscription(user.id);

  return (
    <QueryProvider>
      <AuthInitializer user={user} subscription={sub} />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          {children}
        </main>
      </div>
    </QueryProvider>
  );
}
