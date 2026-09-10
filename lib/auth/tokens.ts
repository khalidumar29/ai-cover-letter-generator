import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { prisma } from "@/lib/prisma";

export const EMAIL_VERIFICATION = "EMAIL_VERIFICATION";
export const PASSWORD_RESET = "PASSWORD_RESET";

export type TokenType = typeof EMAIL_VERIFICATION | typeof PASSWORD_RESET;

export const TOKEN_TTL_MS: Record<TokenType, number> = {
  [EMAIL_VERIFICATION]: 24 * 60 * 60 * 1000, // 24 hours
  [PASSWORD_RESET]: 60 * 60 * 1000, // 1 hour
};

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Issues a single-use token and returns the raw value, which is only ever sent
 * to the user by email. The database stores the SHA-256 hash, so a leaked
 * database dump cannot be replayed against these endpoints.
 *
 * Any earlier unused token of the same type is invalidated first, so the most
 * recent email in the inbox is always the one that works.
 */
export async function issueToken(userId: string, type: TokenType): Promise<string> {
  const rawToken = randomBytes(32).toString("base64url");

  await prisma.$transaction([
    prisma.authToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.authToken.create({
      data: {
        userId,
        type,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS[type]),
      },
    }),
  ]);

  return rawToken;
}

export type ConsumeResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

/**
 * Validates a token and marks it used in the same step, so a link cannot be
 * replayed even if the mailbox is later compromised.
 */
export async function consumeToken(
  rawToken: string,
  type: TokenType,
): Promise<ConsumeResult> {
  const record = await prisma.authToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || !safeEqual(record.type, type)) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };

  // updateMany with a usedAt guard makes concurrent submissions of the same
  // link resolve to exactly one winner.
  const claimed = await prisma.authToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count === 0) return { ok: false, reason: "used" };

  return { ok: true, userId: record.userId };
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}
