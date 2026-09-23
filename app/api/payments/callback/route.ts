import { ok, serverError } from "@/lib/http";
import { readJson } from "@/lib/http";
import { settlePayment } from "@/lib/payments/settle";
import { NextResponse } from "next/server";

/**
 * Public callback the gateway posts its outcome to, equivalent to an IPN or
 * webhook endpoint. It is unauthenticated by necessity — the request comes
 * from the gateway, not the browser — so the signature check inside
 * `settlePayment` is the only thing that makes it trustworthy.
 */
export async function POST(request: Request) {
  try {
    const result = await settlePayment(await readJson(request));

    if (!result.ok) {
      // Deliberately uninformative: a caller probing this endpoint should not
      // learn which references exist or why a payload was rejected.
      return NextResponse.json({ ok: false, error: "Callback rejected." }, { status: 400 });
    }

    return ok({ status: result.status });
  } catch (cause) {
    return serverError("payment-callback", cause);
  }
}
