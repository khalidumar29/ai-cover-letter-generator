"use client";

import { Ban, CreditCard, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";

import { postJson } from "@/app/shared/api";
import { formatMoney } from "@/lib/format";
import type { GatewayOutcome } from "@/lib/payments/gateway";

/**
 * The payer-facing half of the sandbox gateway. It collects a choice and sends
 * it to the gateway endpoint — it never decides the result itself, and the
 * application only learns the outcome from the verified callback.
 */
export default function CheckoutClient({
  reference,
  amountCents,
  currency,
  item,
  signature,
}: {
  reference: string;
  amountCents: number;
  currency: string;
  item: string;
  signature: string;
}) {
  const [pending, setPending] = useState<GatewayOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(outcome: GatewayOutcome) {
    setPending(outcome);
    setError(null);

    const response = await postJson("/api/checkout/sandbox", {
      reference,
      outcome,
      amountCents,
      currency,
      signature,
    });

    if (!response.ok) {
      setPending(null);
      setError(response.error);
      return;
    }

    window.location.href = `/credits/result?ref=${encodeURIComponent(reference)}`;
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-5 flex items-center gap-2 text-[13px] text-[#52525B]">
        <ShieldCheck size={15} aria-hidden="true" />
        Sandbox payment gateway
      </div>

      <div className="rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p className="text-sm text-[#52525B]">Amount due</p>
        <p className="mt-1 text-[32px] font-bold leading-9 tracking-[-0.02em]">
          {formatMoney(amountCents, currency)}
        </p>

        <dl className="mt-5 space-y-2 border-t border-[#ECECEF] pt-4 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-[#71717A]">Item</dt>
            <dd className="font-medium">{item}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#71717A]">Reference</dt>
            <dd className="truncate font-mono text-[12px]">{reference}</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-5 rounded-lg border border-[#FBD5D5] bg-[#FEF2F2] px-3.5 py-3 text-[13px] leading-5 text-[#B91C1C]">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-2">
          <GatewayButton
            outcome="success"
            pending={pending}
            onClick={submit}
            icon={CreditCard}
            className="bg-[#6D5DFB] text-white hover:bg-[#5D4EEA]"
          >
            Pay {formatMoney(amountCents, currency)}
          </GatewayButton>

          <GatewayButton
            outcome="failure"
            pending={pending}
            onClick={submit}
            icon={XCircle}
            className="border border-[#E4E4E7] bg-white text-[#52525B] hover:bg-[#F7F7F8]"
          >
            Simulate a declined card
          </GatewayButton>

          <GatewayButton
            outcome="cancel"
            pending={pending}
            onClick={submit}
            icon={Ban}
            className="border border-transparent bg-transparent text-[#71717A] hover:bg-[#F7F7F8]"
          >
            Cancel and go back
          </GatewayButton>
        </div>
      </div>

      <p className="mt-5 text-center text-[13px] leading-5 text-[#71717A]">
        No card details are collected and no money moves. Choose an outcome to exercise the
        matching path in the application.
      </p>
    </div>
  );
}

function GatewayButton({
  outcome,
  pending,
  onClick,
  icon: Icon,
  className,
  children,
}: {
  outcome: GatewayOutcome;
  pending: GatewayOutcome | null;
  onClick: (outcome: GatewayOutcome) => void;
  icon: typeof CreditCard;
  className: string;
  children: React.ReactNode;
}) {
  const busy = pending === outcome;

  return (
    <button
      type="button"
      onClick={() => onClick(outcome)}
      disabled={pending !== null}
      className={`focus-ring flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium transition duration-[120ms] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {busy ? (
        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
      ) : (
        <Icon size={15} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
