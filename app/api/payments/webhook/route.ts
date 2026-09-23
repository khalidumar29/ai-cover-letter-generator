import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { serverError } from "@/lib/http";
import { settleCheckoutSession } from "@/lib/payments/settle";
import { constructWebhookEvent } from "@/lib/payments/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return rejected();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(await request.text(), signature);
  } catch (cause) {
    console.warn("[payments] webhook signature rejected", cause);
    return rejected();
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.expired":
        await settleCheckoutSession(event.data.object);
        break;
      case "checkout.session.async_payment_failed":
        await settleCheckoutSession(event.data.object, { asyncPaymentFailed: true });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (cause) {
    return serverError("stripe-webhook", cause);
  }
}

function rejected() {
  return NextResponse.json({ ok: false, error: "Webhook rejected." }, { status: 400 });
}
