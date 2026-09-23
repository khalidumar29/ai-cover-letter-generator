import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

/**
 * Runs on the Edge runtime (the file convention Next.js 16 renamed from
 * `middleware`), so it only checks the session signature — no database.
 * Whether the email is verified is enforced in the protected layout, which
 * can read the user row.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/account",
  "/letters",
  "/credits",
  "/checkout",
  "/admin",
];
const GUEST_ONLY = ["/login", "/signup", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      // Preserve where the user was heading so login can send them back.
      loginUrl.searchParams.set("next", `${pathname}${search}`);

      const response = NextResponse.redirect(loginUrl);
      // Clear a stale or tampered cookie so the browser stops sending it.
      if (token) response.cookies.delete(SESSION_COOKIE);
      return response;
    }
    return NextResponse.next();
  }

  if (session && GUEST_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
