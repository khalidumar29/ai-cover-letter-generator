import Link from "next/link";
import { Receipt } from "lucide-react";

import { formatDateTime, formatMoney } from "@/lib/format";
import { PAYMENT_STATUSES } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, PageHeader, type BadgeTone } from "@/app/shared/ui";

export const metadata = { title: "Payments · Admin" };

const TONES: Record<string, BadgeTone> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "error",
  CANCELLED: "neutral",
};

type Search = Promise<{ status?: string }>;

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Search }) {
  const { status } = await searchParams;
  const activeStatus = PAYMENT_STATUSES.includes(status as never) ? status : undefined;

  const [payments, totals] = await Promise.all([
    prisma.payment.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.payment.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (value: string) =>
    totals.find((entry) => entry.status === value)?._count ?? 0;

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every checkout attempt, including the ones that failed or were cancelled."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip href="/admin/payments" label="All" active={!activeStatus} />
        {PAYMENT_STATUSES.map((value) => (
          <FilterChip
            key={value}
            href={`/admin/payments?status=${value}`}
            label={`${value.charAt(0)}${value.slice(1).toLowerCase()} (${countFor(value)})`}
            active={activeStatus === value}
          />
        ))}
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments to show."
          description="Checkout attempts appear here as soon as someone starts one."
        />
      ) : (
        <ul className="divide-y divide-[#ECECEF] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white">
          {payments.map((payment) => (
            <li key={payment.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {payment.user.name}{" "}
                  <span className="font-normal text-[#71717A]">{payment.user.email}</span>
                </p>
                <p className="mt-0.5 truncate font-mono text-[12px] text-[#A1A1AA]">
                  {payment.reference}
                  {payment.failureCode ? ` · ${payment.failureCode}` : ""}
                </p>
              </div>

              <span className="hidden text-[13px] text-[#71717A] md:block">
                {payment.packageName} · {payment.credits} cr
              </span>
              <span className="text-[13px] text-[#71717A]">
                {formatDateTime(payment.createdAt)}
              </span>
              <span className="text-sm font-medium tabular-nums">
                {formatMoney(payment.amountCents, payment.currency)}
              </span>
              <Badge tone={TONES[payment.status] ?? "neutral"}>{payment.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`focus-ring flex h-8 items-center rounded-full border px-3.5 text-[13px] font-medium transition duration-[120ms] ${
        active
          ? "border-[#DDD8FF] bg-[#F1EFFE] text-[#5D4EEA]"
          : "border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#D4D4D8] hover:bg-[#F7F7F8]"
      }`}
    >
      {label}
    </Link>
  );
}
