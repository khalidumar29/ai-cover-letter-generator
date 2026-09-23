import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { appUrl, optionalEnv, requireEnv } from "@/lib/env";

/**
 * Sandbox payment gateway.
 *
 * The project has to demonstrate a gateway integration without depending on a
 * live merchant account, so the gateway is simulated — but the *protocol* is
 * the real one: the browser is redirected to a hosted page the application
 * does not control, that page reports an outcome back to a callback URL, and
 * the callback is trusted only after its signature and amount are verified
 * server-side. Nothing about the outcome is decided by the client.
 *
 * Swapping in SSLCommerz or Stripe means replacing `createSession` with their
 * session call and `verifyCallback` with their validation API. Everything
 * above this module — the Payment rows, the credit ledger, the result pages —
 * stays as it is.
 */

export const GATEWAY_NAME = "sandbox";

/** Outcomes the hosted page can report, mirroring a real gateway's callbacks. */
export const GATEWAY_OUTCOMES = ["success", "failure", "cancel"] as const;

export type GatewayOutcome = (typeof GATEWAY_OUTCOMES)[number];

export type CheckoutSession = {
  reference: string;
  redirectUrl: string;
};

export type CallbackPayload = {
  reference: string;
  outcome: GatewayOutcome;
  amountCents: number;
  currency: string;
  signature: string;
};

/**
 * Signing key for the sandbox. A real gateway issues this as a merchant secret;
 * here it is derived from AUTH_SECRET so the project runs with no extra
 * configuration, while still failing closed if AUTH_SECRET is missing.
 */
function gatewaySecret(): string {
  return optionalEnv("PAYMENT_GATEWAY_SECRET", "") || requireEnv("AUTH_SECRET");
}

function sign(parts: (string | number)[]): string {
  return createHmac("sha256", gatewaySecret()).update(parts.join("|")).digest("hex");
}

/** Gateway-side reference. Unpredictable, so a callback cannot be guessed. */
export function newReference(): string {
  return `SBX-${Date.now().toString(36).toUpperCase()}-${randomBytes(6).toString("hex").toUpperCase()}`;
}

/**
 * Starts a hosted checkout. The amount is signed into the redirect so the
 * hosted page cannot be reopened with a different price.
 */
export function createSession(input: {
  reference: string;
  amountCents: number;
  currency: string;
  packageName: string;
}): CheckoutSession {
  const { reference, amountCents, currency, packageName } = input;

  const params = new URLSearchParams({
    ref: reference,
    amount: String(amountCents),
    currency,
    item: packageName,
    sig: sign(["session", reference, amountCents, currency]),
  });

  return {
    reference,
    redirectUrl: `${appUrl()}/checkout/sandbox?${params.toString()}`,
  };
}

/** Rejects a tampered or replayed hosted-checkout link. */
export function verifySession(input: {
  reference: string;
  amountCents: number;
  currency: string;
  signature: string;
}): boolean {
  return safeEqual(
    input.signature,
    sign(["session", input.reference, input.amountCents, input.currency]),
  );
}

/** Signature the hosted page attaches to the outcome it reports back. */
export function signCallback(input: {
  reference: string;
  outcome: GatewayOutcome;
  amountCents: number;
  currency: string;
}): string {
  return sign([
    "callback",
    input.reference,
    input.outcome,
    input.amountCents,
    input.currency,
  ]);
}

export type VerificationResult =
  | { ok: true; reference: string; outcome: GatewayOutcome; amountCents: number; currency: string }
  | { ok: false; reason: "malformed" | "signature" };

/**
 * The only place a callback becomes trustworthy. Credits must never be added
 * on the basis of an unverified payload.
 */
export function verifyCallback(payload: unknown): VerificationResult {
  if (!payload || typeof payload !== "object") return { ok: false, reason: "malformed" };
  const body = payload as Record<string, unknown>;

  const reference = typeof body.reference === "string" ? body.reference : "";
  const outcome = body.outcome as GatewayOutcome;
  const amountCents = Number(body.amountCents);
  const currency = typeof body.currency === "string" ? body.currency : "";
  const signature = typeof body.signature === "string" ? body.signature : "";

  if (
    !reference ||
    !currency ||
    !signature ||
    !GATEWAY_OUTCOMES.includes(outcome) ||
    !Number.isInteger(amountCents) ||
    amountCents <= 0
  ) {
    return { ok: false, reason: "malformed" };
  }

  if (!safeEqual(signature, signCallback({ reference, outcome, amountCents, currency }))) {
    return { ok: false, reason: "signature" };
  }

  return { ok: true, reference, outcome, amountCents, currency };
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}
