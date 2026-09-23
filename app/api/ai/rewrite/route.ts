import { rewritePassage } from "@/lib/ai/cover-letter";
import { requireApiUser } from "@/lib/auth/guard";
import { rateLimit } from "@/lib/auth/rate-limit";
import { fail, guardFailure, notFound, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { rewriteSchema, toFieldErrors } from "@/lib/validation";
import type { RewriteAction } from "@/lib/domain";

/**
 * Contextual edits from the editor's selection toolbar.
 *
 * These refine a letter the user has already paid to generate, so they cost no
 * credit — the rate limit is what keeps the endpoint from being used as a free
 * general-purpose model.
 */
export async function POST(request: Request) {
  try {
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);
    const { user } = guard;

    const limit = rateLimit(`rewrite:${user.id}`, 60, 60 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const parsed = rewriteSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }
    const { letterId, passage, action, instruction } = parsed.data;

    const letter = await prisma.coverLetter.findFirst({
      where: { id: letterId, userId: user.id },
      select: { content: true, tone: true },
    });
    if (!letter) return notFound("Cover letter not found.");

    const replacement = await rewritePassage({
      passage,
      action: action as RewriteAction,
      instruction,
      letter: letter.content,
      tone: letter.tone,
    });

    return ok({ replacement });
  } catch (cause) {
    return serverError("rewrite-passage", cause);
  }
}
