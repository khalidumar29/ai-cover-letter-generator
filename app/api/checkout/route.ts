import { requireApiUser } from "@/lib/auth/guard";
import { rateLimit } from "@/lib/auth/rate-limit";
import { fail, guardFailure, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { createSession, GATEWAY_NAME, newReference } from "@/lib/payments/gateway";
import { prisma } from "@/lib/prisma";
import { checkoutSchema, toFieldErrors } from "@/lib/validation";

/**
 * Starts a purchase: records a pending payment, then hands back the gateway's
 * hosted-checkout URL for the browser to follow. Credits are not touched here
 * — only a verified callback can add them.
 */
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

    const reference = newReference();

    // Price, credits and name are copied onto the payment so a later edit to
    // the package cannot change what this purchase was for.
    await prisma.payment.create({
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

    const session = createSession({
      reference,
      amountCents: creditPackage.priceCents,
      currency: creditPackage.currency,
      packageName: creditPackage.name,
    });

    return ok({ redirectUrl: session.redirectUrl, reference }, 201);
  } catch (cause) {
    return serverError("checkout", cause);
  }
}
