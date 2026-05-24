import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/scores",
  "/draws",
  "/charity",
  "/winnings",
  "/subscription",
  "/profile",
];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

// Routes accessible only when NOT authenticated
const AUTH_ROUTES = ["/login", "/signup", "/verify-email"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Auth routes — redirect to dashboard if already logged in
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Protected routes — redirect to login if not authenticated
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAdmin = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected || isAdmin) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin route — check role via user metadata
    if (isAdmin) {
      const role = user.user_metadata?.role as string | undefined;
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
