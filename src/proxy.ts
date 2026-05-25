import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_ROUTES = [
  "/dashboard", "/scores", "/draws",
  "/charity", "/winnings", "/subscription", "/profile",
];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/signup", "/verify-email"];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (user) return NextResponse.redirect(new URL("/dashboard", request.url));
    return supabaseResponse;
  }

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected || isAdmin) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAdmin && user.user_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
