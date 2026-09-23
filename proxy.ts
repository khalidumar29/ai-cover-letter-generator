import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/account",
  "/letters",
  "/credits",
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
      loginUrl.searchParams.set("next", `${pathname}${search}`);

      const response = NextResponse.redirect(loginUrl);
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};
