import { requireApiUser } from "@/lib/auth/guard";
import { rateLimit } from "@/lib/auth/rate-limit";
import { generateAndSave, InsufficientCreditsError } from "@/lib/cover-letters";
import { fail, guardFailure, notFound, ok, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

/**
 * Rewrites a letter from the brief already stored on it. This is a fresh
 * generation, so it costs a credit like any other.
 */
export async function POST(_request: Request, { params }: Context) {
  try {
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);
    const { user } = guard;

    const limit = rateLimit(`generate:${user.id}`, 20, 60 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const { id } = await params;
    const letter = await prisma.coverLetter.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        jobTitle: true,
        company: true,
        jobDescription: true,
        tone: true,
        skills: true,
        experience: true,
      },
    });
    if (!letter) return notFound("Cover letter not found.");

    const { id: letterId, ...input } = letter;
    const result = await generateAndSave({ user, input, replaceLetterId: letterId });

    const refreshed = await prisma.coverLetter.findUnique({ where: { id: letterId } });
    return ok({ ...result, letter: refreshed });
  } catch (cause) {
    if (cause instanceof InsufficientCreditsError) {
      return fail("You are out of credits. Top up to keep generating.", 402);
    }
    return serverError("regenerate-cover-letter", cause);
  }
}
