import Stripe from "stripe";

import { requireApiUser } from "@/lib/auth/guard";
import { rateLimit } from "@/lib/auth/rate-limit";
import { fail, guardFailure, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import {
  createCheckoutSession,
  GATEWAY_NAME,
  isStripeConfigured,
  newReference,
} from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";
import { checkoutSchema, toFieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);
    const { user } = guard;

    const limit = rateLimit(`checkout:${user.id}`, 15, 15 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const parsed = checkoutSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }

    const creditPackage = await prisma.creditPackage.findFirst({
      where: { slug: parsed.data.packageSlug, active: true },
    });
    if (!creditPackage) return fail("That credit package is not available.", 404);

    if (!isStripeConfigured()) {
      console.error("[checkout] STRIPE_SECRET_KEY is not set; see .env.example");
      return fail("Payments are not set up yet. Please try again later.", 503);
    }

    const reference = newReference();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        packageId: creditPackage.id,
        packageName: creditPackage.name,
        credits: creditPackage.credits,
        amountCents: creditPackage.priceCents,
        currency: creditPackage.currency,
        reference,
        gateway: GATEWAY_NAME,
      },
    });

    let session;
    try {
      session = await createCheckoutSession({
        reference,
        amountCents: creditPackage.priceCents,
        currency: creditPackage.currency,
        packageName: creditPackage.name,
        credits: creditPackage.credits,
        customerEmail: user.email,
      });
    } catch (cause) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failureCode: "gateway_error", completedAt: new Date() },
      });
      if (!(cause instanceof Stripe.errors.StripeError)) throw cause;

      console.error(`[checkout] Stripe rejected the session: ${cause.type} ${cause.message}`);
      return fail("We couldn't start the checkout. Please try again in a moment.", 502);
    }

    if (!session.url) throw new Error(`Checkout session ${session.id} has no URL`);

    await prisma.payment.update({
      where: { id: payment.id },
      data: { gatewaySessionId: session.id },
    });

    return ok({ redirectUrl: session.url, reference }, 201);
  } catch (cause) {
    return serverError("checkout", cause);
  }
}
