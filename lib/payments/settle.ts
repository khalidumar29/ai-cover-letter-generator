import "server-only";

import type Stripe from "stripe";

import { addCredits } from "@/lib/credits";
import { CREDIT_REASONS } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/payments/stripe";

export type SettlementOutcome = "success" | "failure" | "cancel" | "pending";

export type SettlementResult =
  | {
      ok: true;
      status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
      reference: string;
      alreadySettled: boolean;
    }
  | { ok: false; reason: "unknown" | "session-mismatch" | "amount-mismatch" };

function outcomeOf(session: Stripe.Checkout.Session, failed: boolean): SettlementOutcome {
  if (failed) return "failure";
  if (session.status === "expired") return "cancel";
  if (
    session.status === "complete" &&
    (session.payment_status === "paid" || session.payment_status === "no_payment_required")
  ) {
    return "success";
  }
  return "pending";
}

export async function settleCheckoutSession(
  session: Stripe.Checkout.Session,
  options: { asyncPaymentFailed?: boolean } = {},
): Promise<SettlementResult> {
  const reference = session.client_reference_id ?? session.metadata?.reference;
  if (!reference) return { ok: false, reason: "unknown" };

  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) return { ok: false, reason: "unknown" };

  if (payment.gatewaySessionId && payment.gatewaySessionId !== session.id) {
    console.warn(`[payments] session mismatch on ${payment.reference}`);
    return { ok: false, reason: "session-mismatch" };
  }

  if (payment.status !== "PENDING") {
    return {
      ok: true,
      status: payment.status as "PAID" | "FAILED" | "CANCELLED",
      reference: payment.reference,
      alreadySettled: true,
    };
  }

  const outcome = outcomeOf(session, options.asyncPaymentFailed ?? false);

  if (outcome === "pending") {
    return { ok: true, status: "PENDING", reference: payment.reference, alreadySettled: false };
  }

  if (outcome !== "success") {
    const status = outcome === "cancel" ? "CANCELLED" : "FAILED";
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: {
        status,
        failureCode: outcome === "cancel" ? "cancelled_or_expired" : "declined",
        completedAt: new Date(),
      },
    });
    return { ok: true, status, reference: payment.reference, alreadySettled: false };
  }

  if (
    session.amount_total !== payment.amountCents ||
    session.currency?.toUpperCase() !== payment.currency.toUpperCase()
  ) {
    console.warn(`[payments] amount mismatch on ${payment.reference}`);
    await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "FAILED", failureCode: "amount_mismatch", completedAt: new Date() },
    });
    return { ok: false, reason: "amount-mismatch" };
  }

  const credited = await prisma.$transaction(async (tx) => {
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "PAID", completedAt: new Date() },
    });
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

export async function syncPendingPayment(payment: {
  status: string;
  gatewaySessionId: string | null;
}): Promise<void> {
  if (payment.status !== "PENDING" || !payment.gatewaySessionId) return;

  try {
    const session = await stripe().checkout.sessions.retrieve(payment.gatewaySessionId);
    await settleCheckoutSession(session);
  } catch (cause) {
    console.error("[payments] could not sync session", cause);
  }
}
