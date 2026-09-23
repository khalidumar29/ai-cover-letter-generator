import Link from "next/link";
import { FilePlus2, FileText, Sparkles } from "lucide-react";

import { requirePageUser } from "@/lib/auth/guard";
import { LETTER_STATUSES, matchLabel, statusLabel, toneLabel } from "@/lib/domain";
import { formatRelative } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Badge, ButtonLink, EmptyState, PageHeader, type BadgeTone } from "@/app/shared/ui";
import LetterActions from "./letter-actions";

const STATUS_TONES: Record<string, BadgeTone> = {
  DRAFT: "neutral",
  READY: "success",
  SUBMITTED: "info",
  ARCHIVED: "neutral",
};

export const metadata = { title: "Cover letters" };

type Search = Promise<{ status?: string }>;

export default async function LettersPage({ searchParams }: { searchParams: Search }) {
  const user = await requirePageUser();
  const { status } = await searchParams;

  const activeStatus = LETTER_STATUSES.some((entry) => entry.value === status)
    ? status
    : undefined;

  const [letters, total] = await Promise.all([
    prisma.coverLetter.findMany({
      where: { userId: user.id, ...(activeStatus ? { status: activeStatus } : {}) },
      orderBy: { updatedAt: "desc" },
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
    prisma.coverLetter.count({ where: { userId: user.id } }),
  ]);

  return (
    <>
      <PageHeader
        title="Cover letters"
        description="Every letter you have generated, newest first."
        actions={
          <ButtonLink href="/letters/new" variant="primary" icon={Sparkles}>
            New cover letter
          </ButtonLink>
        }
      />

      {total > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <FilterChip href="/letters" label="All" active={!activeStatus} />
          {LETTER_STATUSES.map((entry) => (
            <FilterChip
              key={entry.value}
              href={`/letters?status=${entry.value}`}
              label={entry.label}
              active={activeStatus === entry.value}
            />
          ))}
        </div>
      )}

      {letters.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            activeStatus
              ? `No ${statusLabel(activeStatus).toLowerCase()} letters`
              : "You haven't created a cover letter yet."
          }
          description={
            activeStatus
              ? "Change the filter to see your other letters."
              : "Create one from a job description and a short summary of your background."
          }
          action={
            !activeStatus && (
              <ButtonLink href="/letters/new" variant="primary" icon={FilePlus2}>
                Create cover letter
              </ButtonLink>
            )
          }
        />
      ) : (
        <ul className="divide-y divide-[#ECECEF] overflow-hidden rounded-[10px] border border-[#E4E4E7] bg-white">
          {letters.map((letter) => (
            <li key={letter.id} className="relative flex items-center gap-4 px-5 py-4">
              <span
                aria-hidden="true"
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E4E4E7] text-[11px] font-semibold text-[#52525B] sm:flex"
              >
                {letter.company.slice(0, 2).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/letters/${letter.id}`}
                  className="focus-ring rounded text-sm font-medium after:absolute after:inset-0 after:content-['']"
                >
                  {letter.jobTitle}
                </Link>
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

              <Badge tone={STATUS_TONES[letter.status] ?? "neutral"}>
                {statusLabel(letter.status)}
              </Badge>

              <div className="relative z-10">
                <LetterActions
                  letterId={letter.id}
                  title={`${letter.jobTitle} at ${letter.company}`}
                />
              </div>
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
