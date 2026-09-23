import Link from "next/link";
import { ChevronLeft, Receipt } from "lucide-react";

import { requirePageUser } from "@/lib/auth/guard";
import { formatDateTime, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Badge, ButtonLink, EmptyState, PageHeader, type BadgeTone } from "@/app/shared/ui";

export const metadata = { title: "Credit history" };

const PAYMENT_TONES: Record<string, BadgeTone> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "error",
  CANCELLED: "neutral",
};

const PAYMENT_LABELS: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

const REASON_LABELS: Record<string, string> = {
  SIGNUP_BONUS: "Signup bonus",
  PURCHASE: "Purchase",
  GENERATION: "Generation",
  REFUND: "Refund",
  ADMIN_ADJUSTMENT: "Adjustment",
};

export default async function CreditHistoryPage() {
  const user = await requirePageUser();

  const [payments, ledger] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <>
      <Link
        href="/credits"
        className="focus-ring -ml-1.5 mb-4 inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[13px] text-[#71717A] transition hover:text-[#18181B]"
      >
        <ChevronLeft size={14} aria-hidden="true" />
        Credits
      </Link>

      <PageHeader
        title="Credit history"
        description="Every payment you have made and every credit added or spent."
      />

      <section className="mb-10">
        <h2 className="mb-3 text-[20px] font-semibold leading-7">Payments</h2>

        {payments.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No payments yet."
            description="Buy a credit package and it will appear here with its gateway reference."
            action={<ButtonLink href="/credits">See packages</ButtonLink>}
          />
        ) : (
          <ul className="divide-y divide-[#ECECEF] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white">
            {payments.map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {payment.packageName} · {payment.credits} credits
                  </p>
                  <p className="mt-0.5 font-mono text-[12px] text-[#A1A1AA]">
                    {payment.reference}
                  </p>
                </div>
                <span className="text-[13px] text-[#71717A]">
                  {formatDateTime(payment.createdAt)}
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {formatMoney(payment.amountCents, payment.currency)}
                </span>
                <Badge tone={PAYMENT_TONES[payment.status] ?? "neutral"}>
                  {PAYMENT_LABELS[payment.status] ?? payment.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[20px] font-semibold leading-7">Credit ledger</h2>

        {ledger.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Nothing recorded yet."
            description="Credits added and spent are listed here as they happen."
          />
        ) : (
          <ul className="divide-y divide-[#ECECEF] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white">
            {ledger.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{entry.description}</p>
                  <p className="mt-0.5 text-[12px] text-[#A1A1AA]">
                    {REASON_LABELS[entry.reason] ?? entry.reason} ·{" "}
                    {formatDateTime(entry.createdAt)}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium tabular-nums ${
                    entry.delta > 0 ? "text-[#16A34A]" : "text-[#52525B]"
                  }`}
                >
                  {entry.delta > 0 ? "+" : ""}
                  {entry.delta}
                </span>
                <span className="w-[72px] text-right text-[13px] tabular-nums text-[#71717A]">
                  {entry.balanceAfter} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
