import Link from "next/link";
import { ArrowRight, FileText, Files, Send, Sparkles, Wallet } from "lucide-react";

import { requirePageUser } from "@/lib/auth/guard";
import { matchLabel, statusLabel, toneLabel } from "@/lib/domain";
import { formatRelative } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Badge, ButtonLink, Card, EmptyState, PageHeader } from "@/app/shared/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requirePageUser();

  const [total, submitted, recent, spent] = await Promise.all([
    prisma.coverLetter.count({ where: { userId: user.id } }),
    prisma.coverLetter.count({ where: { userId: user.id, status: "SUBMITTED" } }),
    prisma.coverLetter.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        jobTitle: true,
        company: true,
        tone: true,
        status: true,
        matchScore: true,
        updatedAt: true,
      },
    }),
    prisma.creditTransaction.aggregate({
      where: { userId: user.id, reason: "GENERATION" },
      _sum: { delta: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}.`}
        description="Pick up where you left off, or start a letter for a new role."
        actions={
          <ButtonLink href="/letters/new" variant="primary" icon={Sparkles}>
            New cover letter
          </ButtonLink>
        }
      />

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Sparkles} label="Credits left" value={user.credits} href="/credits" />
        <Stat icon={Files} label="Cover letters" value={total} href="/letters" />
        <Stat icon={Send} label="Submitted" value={submitted} href="/letters?status=SUBMITTED" />
        <Stat
          icon={Wallet}
          label="Credits used"
          value={Math.abs(spent._sum.delta ?? 0)}
          href="/credits/history"
        />
      </dl>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-[20px] font-semibold leading-7">Recent letters</h2>
          {total > 0 && (
            <Link
              href="/letters"
              className="focus-ring flex items-center gap-1 rounded-lg px-1.5 py-1 text-[13px] font-medium text-[#52525B] transition hover:text-[#18181B]"
            >
              View all
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="You haven't created a cover letter yet."
            description="Create one from a job description and a short summary of your background. You have free credits to start with."
            action={
              <ButtonLink href="/letters/new" variant="primary" icon={Sparkles}>
                Create cover letter
              </ButtonLink>
            }
          />
        ) : (
          <ul className="divide-y divide-[#ECECEF] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white">
            {recent.map((letter) => (
              <li key={letter.id}>
                <Link
                  href={`/letters/${letter.id}`}
                  className="focus-ring flex items-center gap-4 px-5 py-4 transition hover:bg-[#FAFAFA]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{letter.jobTitle}</p>
                    <p className="mt-0.5 truncate text-[13px] text-[#71717A]">
                      {letter.company} · {toneLabel(letter.tone)} tone · edited{" "}
                      {formatRelative(letter.updatedAt)}
                    </p>
                  </div>

                  {letter.matchScore !== null && (
                    <span className="hidden text-[13px] text-[#52525B] md:block">
                      {matchLabel(letter.matchScore)} · {letter.matchScore}%
                    </span>
                  )}

                  <Badge tone={letter.status === "SUBMITTED" ? "info" : "neutral"}>
                    {statusLabel(letter.status)}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {user.credits === 0 && (
        <Card className="mt-6 flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">You are out of credits.</p>
            <p className="mt-1 text-sm leading-5 text-[#52525B]">
              Your existing letters stay editable and exportable. Top up to generate new ones.
            </p>
          </div>
          <ButtonLink href="/credits" variant="primary" icon={Wallet}>
            Buy credits
          </ButtonLink>
        </Card>
      )}
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Sparkles;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="focus-ring rounded-[10px] border border-[#E4E4E7] bg-white p-5 transition duration-[120ms] hover:border-[#D4D4D8]"
    >
      <dt className="flex items-center gap-2 text-sm text-[#52525B]">
        <Icon size={15} className="text-[#71717A]" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-2 text-[24px] font-semibold leading-7 tabular-nums">{value}</dd>
    </Link>
  );
}
