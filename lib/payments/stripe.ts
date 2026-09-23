import "server-only";

import { randomBytes } from "node:crypto";
import Stripe from "stripe";

import { appUrl, requireEnv } from "@/lib/env";

export const GATEWAY_NAME = "stripe";

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  client ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return client;
}

export function newReference(): string {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function createCheckoutSession(input: {
  reference: string;
  amountCents: number;
  currency: string;
  packageName: string;
  credits: number;
  customerEmail: string;
}): Promise<Stripe.Checkout.Session> {
  const { reference, amountCents, currency, packageName, credits, customerEmail } = input;
  const ref = encodeURIComponent(reference);

  return stripe().checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: reference,
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amountCents,
            product_data: {
              name: `${packageName} credit package`,
              description: `${credits} cover letter credits`,
            },
          },
        },
      ],
      metadata: { reference },
      integration_identifier: "credit-packages-qmfhzkwt",
      success_url: `${appUrl()}/credits/result?ref=${ref}`,
      cancel_url: `${appUrl()}/api/checkout/cancel?ref=${ref}`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    { idempotencyKey: `checkout-${reference}` },
  );
}

export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  return stripe().webhooks.constructEvent(
    rawBody,
    signature,
    requireEnv("STRIPE_WEBHOOK_SECRET"),
  );
}
