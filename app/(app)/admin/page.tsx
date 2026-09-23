import { CreditCard, Files, Sparkles, Users } from "lucide-react";

import { formatDateTime, formatMoney } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, type BadgeTone } from "@/app/shared/ui";

export const metadata = { title: "Admin" };

const PAYMENT_TONES: Record<string, BadgeTone> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "error",
  CANCELLED: "neutral",
};

export default async function AdminOverviewPage() {
  const [users, verified, letters, paidPayments, creditsSold, creditsUsed, recent] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerifiedAt: { not: null } } }),
      prisma.coverLetter.count(),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.creditTransaction.aggregate({
        where: { reason: "PURCHASE" },
        _sum: { delta: true },
      }),
      prisma.creditTransaction.aggregate({
        where: { reason: "GENERATION" },
        _sum: { delta: true },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Accounts, generation volume and payment activity across the whole application."
      />

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Registered users" value={String(users)} note={`${verified} confirmed`} />
        <Stat icon={Files} label="Cover letters" value={String(letters)} note="generated in total" />
        <Stat
          icon={CreditCard}
          label="Revenue"
          value={formatMoney(paidPayments._sum.amountCents ?? 0)}
          note={`${paidPayments._count} paid ${paidPayments._count === 1 ? "payment" : "payments"}`}
        />
        <Stat
          icon={Sparkles}
          label="Credits"
          value={String(creditsSold._sum.delta ?? 0)}
          note={`${Math.abs(creditsUsed._sum.delta ?? 0)} used`}
        />
      </dl>

      <section className="mt-10">
        <h2 className="mb-3 text-[20px] font-semibold leading-7">Recent payments</h2>

        {recent.length === 0 ? (
          <Card>
            <p className="text-sm text-[#52525B]">No payments have been attempted yet.</p>
          </Card>
        ) : (
          <ul className="divide-y divide-[#ECECEF] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white">
            {recent.map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{payment.user.name}</p>
                  <p className="truncate text-[13px] text-[#71717A]">
                    {payment.packageName} · {payment.credits} credits ·{" "}
                    {formatDateTime(payment.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {formatMoney(payment.amountCents, payment.currency)}
                </span>
                <Badge tone={PAYMENT_TONES[payment.status] ?? "neutral"}>{payment.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card className="p-5">
      <dt className="flex items-center gap-2 text-sm text-[#52525B]">
        <Icon size={15} className="text-[#71717A]" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-2 text-[24px] font-semibold leading-7 tabular-nums">{value}</dd>
      <p className="mt-1 text-[13px] text-[#71717A]">{note}</p>
    </Card>
  );
}
