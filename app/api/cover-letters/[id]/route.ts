import { requireApiUser } from "@/lib/auth/guard";
import { fail, guardFailure, notFound, ok, readJson, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toFieldErrors, updateLetterSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);

    const { id } = await params;
    const letter = await prisma.coverLetter.findFirst({
      where: { id, userId: guard.user.id },
    });
    if (!letter) return notFound("Cover letter not found.");

    return ok({ letter });
  } catch (cause) {
    return serverError("get-cover-letter", cause);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);

    const parsed = updateLetterSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }

    const { id } = await params;
    const updated = await prisma.coverLetter.updateMany({
      where: { id, userId: guard.user.id },
      data: parsed.data,
    });
    if (updated.count === 0) return notFound("Cover letter not found.");

    const letter = await prisma.coverLetter.findUnique({
      where: { id },
      select: { updatedAt: true, status: true },
    });

    return ok({ letter });
  } catch (cause) {
    return serverError("update-cover-letter", cause);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);

    const { id } = await params;
    const deleted = await prisma.coverLetter.deleteMany({
      where: { id, userId: guard.user.id },
    });
    if (deleted.count === 0) return notFound("Cover letter not found.");

    return ok();
  } catch (cause) {
    return serverError("delete-cover-letter", cause);
  }
}
