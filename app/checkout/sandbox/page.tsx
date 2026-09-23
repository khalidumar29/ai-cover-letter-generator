import { redirect } from "next/navigation";

import { requirePageUser } from "@/lib/auth/guard";
import { verifySession } from "@/lib/payments/gateway";
import CheckoutClient from "./checkout-client";

export const metadata = { title: "Checkout" };

type Search = Promise<{
  ref?: string;
  amount?: string;
  currency?: string;
  item?: string;
  sig?: string;
}>;

/**
 * Hosted checkout, deliberately outside the application shell: a payer on a
 * real gateway is on someone else's page, and the sandbox should not pretend
 * otherwise.
 */
export default async function SandboxCheckoutPage({ searchParams }: { searchParams: Search }) {
  await requirePageUser();

  const { ref, amount, currency, item, sig } = await searchParams;
  const amountCents = Number(amount);

  const valid =
    ref &&
    sig &&
    currency &&
    Number.isInteger(amountCents) &&
    verifySession({ reference: ref, amountCents, currency, signature: sig });

  // A link with an edited amount is not a checkout this gateway issued.
  if (!valid) redirect("/credits?error=invalid-checkout");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F8] px-4 py-12">
      <CheckoutClient
        reference={ref}
        amountCents={amountCents}
        currency={currency}
        item={item || "Credit package"}
        signature={sig}
      />
    </div>
  );
}
