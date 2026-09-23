import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";

export const ADMIN_ROLE = "ADMIN";

export function isAdmin(user: { role: string }): boolean {
  return user.role === ADMIN_ROLE;
}

export async function requirePageUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerifiedAt) redirect("/verify-email");
  return user;
}

export async function requireAdminPage(): Promise<CurrentUser> {
  const user = await requirePageUser();
  if (!isAdmin(user)) redirect("/dashboard");
  return user;
}

export type ApiGuard<T> = { ok: true; user: T } | { ok: false; status: 401 | 403 };

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
