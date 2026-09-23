import { requireApiUser } from "@/lib/auth/guard";
import { guardFailure, notFound, serverError } from "@/lib/http";
import { letterFilename, renderLetterPdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);
    const { user } = guard;

    const { id } = await params;
    const letter = await prisma.coverLetter.findFirst({
      where: { id, userId: user.id },
      select: { jobTitle: true, company: true, content: true, updatedAt: true },
    });
    if (!letter) return notFound("Cover letter not found.");

    const pdf = await renderLetterPdf({
      applicantName: user.name,
      applicantEmail: user.email,
      jobTitle: letter.jobTitle,
      company: letter.company,
      content: letter.content,
      date: letter.updatedAt,
    });

    return new Response(pdf as BodyInit, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${letterFilename(letter.jobTitle, letter.company)}"`,
        // The letter is private and changes on every edit.
        "cache-control": "private, no-store",
      },
    });
  } catch (cause) {
    return serverError("cover-letter-pdf", cause);
  }
}
