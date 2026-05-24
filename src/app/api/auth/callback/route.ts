import { createClient } from "@/lib/supabase/server";
import { createUser, getUserBySupabaseId } from "@/services/auth.service";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Ensure user exists in our DB
  const existingUser = await getUserBySupabaseId(data.user.id);

  if (!existingUser) {
    await createUser({
      supabaseId: data.user.id,
      email: data.user.email!,
      fullName:
        data.user.user_metadata?.full_name ??
        data.user.user_metadata?.name ??
        data.user.email!.split("@")[0]!,
      avatarUrl: data.user.user_metadata?.avatar_url,
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
