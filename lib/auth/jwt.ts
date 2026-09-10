import { SignJWT, jwtVerify } from "jose";

import { requireEnv } from "@/lib/env";

/**
 * Edge-safe half of the session layer: no database and no `next/headers`, so
 * middleware can import it. Anything needing the database lives in session.ts.
 */
export const SESSION_COOKIE = "acl_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  /** Issued-at, in seconds. Compared against User.passwordChangedAt. */
  iat: number;
  exp: number;
};

function secret(): Uint8Array {
  return new TextEncoder().encode(requireEnv("AUTH_SECRET"));
}

export async function signSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret());
}

/** Returns null for any token that is malformed, tampered with, or expired. */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.iat !== "number" || typeof payload.exp !== "number") {
      return null;
    }
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? "USER"),
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
