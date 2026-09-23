import { notFound } from "next/navigation";
import { Ban, CheckCircle2, Sparkles, XCircle } from "lucide-react";

import { requirePageUser } from "@/lib/auth/guard";
import { formatDateTime, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { ButtonLink, Card } from "@/app/shared/ui";

export const metadata = { title: "Payment result" };

const OUTCOMES = {
  PAID: {
    icon: CheckCircle2,
    className: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
    title: "Payment complete",
    body: "The credits are on your account and ready to use.",
  },
  FAILED: {
    icon: XCircle,
    className: "border-[#FBD5D5] bg-[#FEF2F2] text-[#B91C1C]",
    title: "Payment declined",
    body: "Nothing was charged and no credits were added. You can try again.",
  },
  CANCELLED: {
    icon: Ban,
    className: "border-[#E4E4E7] bg-[#F7F7F8] text-[#52525B]",
    title: "Payment cancelled",
    body: "You stopped before the payment went through. No credits were added.",
  },
  PENDING: {
    icon: Sparkles,
    className: "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
    title: "Payment still processing",
    body: "The gateway has not confirmed this payment yet. Refresh in a moment.",
  },
} as const;

type Search = Promise<{ ref?: string }>;

export default async function PaymentResultPage({ searchParams }: { searchParams: Search }) {
  const user = await requirePageUser();
  const { ref } = await searchParams;
  if (!ref) notFound();

  const payment = await prisma.payment.findFirst({
    where: { reference: ref, userId: user.id },
  });
  if (!payment) notFound();

  const outcome = OUTCOMES[payment.status as keyof typeof OUTCOMES] ?? OUTCOMES.PENDING;
  const Icon = outcome.icon;

  return (
    <div className="mx-auto max-w-[520px] pt-6">
      <Card>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${outcome.className}`}
        >
          <Icon size={19} aria-hidden="true" />
        </span>

        <h1 className="mt-4 text-[22px] font-semibold leading-7">{outcome.title}</h1>
        <p className="mt-2 text-sm leading-[21px] text-[#52525B]">{outcome.body}</p>

        <dl className="mt-6 space-y-2.5 border-t border-[#ECECEF] pt-5 text-[13px]">
          <ResultRow label="Package" value={payment.packageName} />
          <ResultRow label="Credits" value={String(payment.credits)} />
          <ResultRow
            label="Amount"
            value={formatMoney(payment.amountCents, payment.currency)}
          />
          <ResultRow label="Reference" value={payment.reference} mono />
          <ResultRow label="Date" value={formatDateTime(payment.createdAt)} />
        </dl>

        {payment.status === "PAID" && (
          <p className="mt-5 rounded-lg border border-[#DDD8FF] bg-[#F1EFFE] px-3.5 py-3 text-[13px] leading-5 text-[#5D4EEA]">
            Your balance is now {user.credits} {user.credits === 1 ? "credit" : "credits"}.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {payment.status === "PAID" ? (
            <ButtonLink href="/letters/new" variant="primary" icon={Sparkles}>
              Write a cover letter
            </ButtonLink>
          ) : (
            <ButtonLink href="/credits" variant="primary">
              Back to credits
            </ButtonLink>
          )}
          <ButtonLink href="/credits/history">View history</ButtonLink>
        </div>
      </Card>
    </div>
  );
}

function ResultRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#71717A]">{label}</dt>
      <dd className={`text-right font-medium ${mono ? "font-mono text-[12px]" : ""}`}>{value}</dd>
    </div>
  );
}
