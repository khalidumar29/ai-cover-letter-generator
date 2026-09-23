import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { requirePageUser } from "@/lib/auth/guard";
import { unpackList } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import LetterEditor from "./letter-editor";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const letter = await prisma.coverLetter.findUnique({
    where: { id },
    select: { jobTitle: true, company: true },
  });

  return { title: letter ? `${letter.jobTitle} · ${letter.company}` : "Cover letter" };
}

export default async function LetterPage({ params }: Props) {
  const user = await requirePageUser();
  const { id } = await params;

  const letter = await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
  });
  if (!letter) notFound();

  return (
    <>
      <Link
        href="/letters"
        className="focus-ring -ml-1.5 mb-4 inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[13px] text-[#71717A] transition hover:text-[#18181B]"
      >
        <ChevronLeft size={14} aria-hidden="true" />
        Cover letters
      </Link>

      <div className="mb-6">
        <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.01em]">
          {letter.jobTitle}
        </h1>
        <p className="mt-1 text-sm text-[#52525B]">{letter.company}</p>
      </div>

      <LetterEditor
        credits={user.credits}
        letter={{
          id: letter.id,
          jobTitle: letter.jobTitle,
          company: letter.company,
          tone: letter.tone,
          status: letter.status,
          content: letter.content,
          matchScore: letter.matchScore,
          matchedSkills: unpackList(letter.matchedSkills),
          missingSkills: unpackList(letter.missingSkills),
          jobDescription: letter.jobDescription,
        }}
      />
    </>
  );
}
