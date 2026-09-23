import "server-only";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
} from "@/lib/auth/jwt";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

export async function startSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): Promise<void> {
  const token = await signSession(user);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      emailVerifiedAt: true,
      createdAt: true,
      passwordChangedAt: true,
    },
  });
  if (!user) return null;

  if (user.passwordChangedAt) {
    const changedAtSeconds = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (payload.iat < changedAtSeconds) return null;
  }

  const { passwordChangedAt: _passwordChangedAt, ...currentUser } = user;
  return currentUser;
}
