import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";

export const ADMIN_ROLE = "ADMIN";

export function isAdmin(user: { role: string }): boolean {
  return user.role === ADMIN_ROLE;
}

/**
 * Guard for server components under `app/(app)`. The layout has already
 * redirected unauthenticated and unverified visitors; this repeats the check
 * so a page is never rendered against a null user by mistake.
 */
export async function requirePageUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerifiedAt) redirect("/verify-email");
  return user;
}

/**
 * Admin screens 404 rather than 403 for signed-in non-admins, so the admin
 * area is not discoverable by probing.
 */
export async function requireAdminPage(): Promise<CurrentUser> {
  const user = await requirePageUser();
  if (!isAdmin(user)) redirect("/dashboard");
  return user;
}

export type ApiGuard<T> = { ok: true; user: T } | { ok: false; status: 401 | 403 };

/** Guard for route handlers, which return a JSON envelope instead of redirecting. */
export async function requireApiUser(): Promise<ApiGuard<CurrentUser>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401 };
  if (!user.emailVerifiedAt) return { ok: false, status: 403 };
  return { ok: true, user };
}

export async function requireApiAdmin(): Promise<ApiGuard<CurrentUser>> {
  const guard = await requireApiUser();
  if (!guard.ok) return guard;
  if (!isAdmin(guard.user)) return { ok: false, status: 403 };
  return guard;
}
