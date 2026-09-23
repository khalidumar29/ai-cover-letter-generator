import { CREDIT_REASONS, type CreditReason } from "@/lib/domain";
import { prisma } from "@/lib/prisma";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export type LedgerEntry = {
  /** The account's balance after the entry was written. */
  balance: number;
  transactionId: string;
};

export class InsufficientCreditsError extends Error {
  constructor(readonly balance: number) {
    super("Not enough credits.");
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Takes credits off an account and writes the matching ledger entry.
 *
 * The balance is decremented with a `gte` guard rather than being read and
 * then written, so two generations started at once cannot both pass the check
 * and push the account negative.
 */
export async function spendCredits(options: {
  userId: string;
  amount: number;
  reason: CreditReason;
  description: string;
  coverLetterId?: string;
  tx?: Tx;
}): Promise<LedgerEntry> {
  const { userId, amount, reason, description, coverLetterId, tx } = options;
  const run = async (client: Tx) => {
    const claimed = await client.user.updateMany({
      where: { id: userId, credits: { gte: amount } },
      data: { credits: { decrement: amount } },
    });

    if (claimed.count === 0) {
      const user = await client.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });
      throw new InsufficientCreditsError(user?.credits ?? 0);
    }

    const { credits } = await client.user.findUniqueOrThrow({
      where: { id: userId },
      select: { credits: true },
    });

    const entry = await client.creditTransaction.create({
      data: {
        userId,
        delta: -amount,
        reason,
        description,
        balanceAfter: credits,
        coverLetterId,
      },
      select: { id: true },
    });

    return { balance: credits, transactionId: entry.id };
  };

  return tx ? run(tx) : prisma.$transaction(run);
}

/** Adds credits and records why. Used by verified payments and by admins. */
export async function addCredits(options: {
  userId: string;
  amount: number;
  reason: CreditReason;
  description: string;
  paymentId?: string;
  tx?: Tx;
}): Promise<LedgerEntry> {
  const { userId, amount, reason, description, paymentId, tx } = options;
  const run = async (client: Tx) => {
    const user = await client.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
      select: { credits: true },
    });

    const entry = await client.creditTransaction.create({
      data: {
        userId,
        delta: amount,
        reason,
        description,
        balanceAfter: user.credits,
        paymentId,
      },
      select: { id: true },
    });

    return { balance: user.credits, transactionId: entry.id };
  };

  return tx ? run(tx) : prisma.$transaction(run);
}

/**
 * Puts a spent credit back when a generation fails after the deduction — the
 * user should not pay for a letter they never received.
 */
export async function refundCredits(options: {
  userId: string;
  amount: number;
  description: string;
}): Promise<void> {
  const { userId, amount, description } = options;
  try {
    await addCredits({
      userId,
      amount,
      reason: CREDIT_REASONS.REFUND,
      description,
    });
  } catch (cause) {
    // A failed refund must not mask the original error the caller is handling.
    console.error("[credits] refund failed", cause);
  }
}
