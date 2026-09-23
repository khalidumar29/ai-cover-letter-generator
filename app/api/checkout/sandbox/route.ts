import { requireApiUser } from "@/lib/auth/guard";
import { fail, guardFailure, ok, readJson, serverError } from "@/lib/http";
import {
  GATEWAY_OUTCOMES,
  signCallback,
  verifySession,
  type GatewayOutcome,
} from "@/lib/payments/gateway";
import { settlePayment } from "@/lib/payments/settle";

/**
 * Stands in for the gateway's own server.
 *
 * The hosted checkout page calls this with the outcome the payer chose. It
 * validates the checkout session it issued, signs the outcome, and submits it
 * through the same settlement path a real callback takes — so the application
 * never trusts an outcome that arrived straight from a browser.
 */
export async function POST(request: Request) {
  try {
    // Only a signed-in payer can drive the hosted page in this sandbox.
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);

    const body = (await readJson(request)) as Record<string, unknown> | null;
    const reference = typeof body?.reference === "string" ? body.reference : "";
    const signature = typeof body?.signature === "string" ? body.signature : "";
    const currency = typeof body?.currency === "string" ? body.currency : "";
    const outcome = body?.outcome as GatewayOutcome;
    const amountCents = Number(body?.amountCents);

    if (!reference || !GATEWAY_OUTCOMES.includes(outcome) || !Number.isInteger(amountCents)) {
      return fail("Invalid checkout request.", 400);
    }

    if (!verifySession({ reference, amountCents, currency, signature })) {
      return fail("This checkout link is no longer valid.", 400);
    }

    const result = await settlePayment({
      reference,
      outcome,
      amountCents,
      currency,
      signature: signCallback({ reference, outcome, amountCents, currency }),
    });

    if (!result.ok) return fail("The payment could not be processed.", 400);

    return ok({ status: result.status, reference: result.reference });
  } catch (cause) {
    return serverError("sandbox-checkout", cause);
  }
}
