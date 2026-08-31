import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Optimistic, cookie-based auth redirect only — this is a UX convenience,
// not the security boundary. Row Level Security in Postgres is what actually
// stops a user from reading/writing another user's data.
//
// AUTH_ONLY_PATHS: signed-out landing pages — bounce a signed-in user away
// from these (there's nothing for them to do at /login once authenticated).
// ALWAYS_ALLOWED: reset-password and the callback route both run *with* an
// active (recovery) session, so they must stay reachable for signed-in users
// too, or password-reset links would bounce straight to /overview.
const AUTH_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];
const ALWAYS_ALLOWED_PATHS = ["/reset-password", "/auth/callback"];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (matchesPath(pathname, ALWAYS_ALLOWED_PATHS)) {
    return response;
  }

  const isAuthOnlyPath = matchesPath(pathname, AUTH_ONLY_PATHS);

  if (!user && !isAuthOnlyPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthOnlyPath) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
