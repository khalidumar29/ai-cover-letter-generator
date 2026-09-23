import { requireApiAdmin } from "@/lib/auth/guard";
import { addCredits, InsufficientCreditsError, spendCredits } from "@/lib/credits";
import { CREDIT_REASONS } from "@/lib/domain";
import { fail, guardFailure, notFound, ok, readJson, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { adjustCreditsSchema, toFieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const guard = await requireApiAdmin();
    if (!guard.ok) return guardFailure(guard.status);

    const parsed = adjustCreditsSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }
    const { userId, delta, description } = parsed.data;

    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!target) return notFound("User not found.");

    const note = `${description} (by ${guard.user.email})`;

    const entry =
      delta > 0
        ? await addCredits({
            userId,
            amount: delta,
            reason: CREDIT_REASONS.ADMIN_ADJUSTMENT,
            description: note,
          })
        : await spendCredits({
            userId,
            amount: -delta,
            reason: CREDIT_REASONS.ADMIN_ADJUSTMENT,
            description: note,
          });

    return ok({ credits: entry.balance });
  } catch (cause) {
    if (cause instanceof InsufficientCreditsError) {
      return fail("That would take the balance below zero.", 409);
    }
    return serverError("adjust-credits", cause);
  }
}
