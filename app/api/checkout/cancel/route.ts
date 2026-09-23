import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/guard";
import { appUrl } from "@/lib/env";
import { settleCheckoutSession, syncPendingPayment } from "@/lib/payments/settle";
import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("ref") ?? "";

  const guard = await requireApiUser();
  if (!guard.ok) return NextResponse.redirect(`${appUrl()}/login`);

  const payment = await prisma.payment.findFirst({
    where: { reference, userId: guard.user.id },
  });
  if (!payment) return NextResponse.redirect(`${appUrl()}/credits`);

  if (payment.status === "PENDING" && payment.gatewaySessionId) {
    try {
      const session = await stripe().checkout.sessions.expire(payment.gatewaySessionId);
      await settleCheckoutSession(session);
    } catch {
      await syncPendingPayment(payment);
    }
  }

  return NextResponse.redirect(
    `${appUrl()}/credits/result?ref=${encodeURIComponent(payment.reference)}`,
  );
}
