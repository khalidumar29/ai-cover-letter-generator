import "server-only";

import { addCredits } from "@/lib/credits";
import { CREDIT_REASONS } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { verifyCallback } from "@/lib/payments/gateway";

export type SettlementResult =
  | { ok: true; status: "PAID" | "FAILED" | "CANCELLED"; reference: string; alreadySettled: boolean }
  | { ok: false; reason: "rejected" | "unknown" | "amount-mismatch" };

/**
 * The single place a gateway callback turns into credits.
 *
 * Three things have to hold before an account is credited: the payload's
 * signature verifies, the payment exists and is still pending, and the amount
 * reported matches the amount recorded when checkout started. The status
 * transition is guarded with `updateMany ... where status = PENDING`, so a
 * callback delivered twice — which real gateways do — credits exactly once.
 */
export async function settlePayment(payload: unknown): Promise<SettlementResult> {
  const verified = verifyCallback(payload);
  if (!verified.ok) {
    console.warn(`[payments] callback rejected: ${verified.reason}`);
    return { ok: false, reason: "rejected" };
  }

  const payment = await prisma.payment.findUnique({
    where: { reference: verified.reference },
  });
  if (!payment) return { ok: false, reason: "unknown" };

  if (payment.amountCents !== verified.amountCents || payment.currency !== verified.currency) {
    // The amount was altered between checkout and callback. Never credit this.
    console.warn(`[payments] amount mismatch on ${payment.reference}`);
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "FAILED", failureCode: "amount_mismatch", completedAt: new Date() },
    });
    return { ok: false, reason: "amount-mismatch" };
  }

  if (payment.status !== "PENDING") {
    return {
      ok: true,
      status: payment.status as "PAID" | "FAILED" | "CANCELLED",
      reference: payment.reference,
      alreadySettled: true,
    };
  }

  if (verified.outcome !== "success") {
    const status = verified.outcome === "cancel" ? "CANCELLED" : "FAILED";
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: {
        status,
        failureCode: verified.outcome === "cancel" ? "cancelled_by_user" : "declined",
        completedAt: new Date(),
      },
    });
    return { ok: true, status, reference: payment.reference, alreadySettled: false };
  }

  const credited = await prisma.$transaction(async (tx) => {
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "PAID", completedAt: new Date() },
    });
    // Another delivery of the same callback won the race; it did the crediting.
    if (claimed.count === 0) return false;

    await addCredits({
      userId: payment.userId,
      amount: payment.credits,
      reason: CREDIT_REASONS.PURCHASE,
      description: `${payment.packageName} package — ${payment.credits} credits`,
      paymentId: payment.id,
      tx,
    });

    return true;
  });

  return {
    ok: true,
    status: "PAID",
    reference: payment.reference,
    alreadySettled: !credited,
  };
}
