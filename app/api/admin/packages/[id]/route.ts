import { requireApiAdmin } from "@/lib/auth/guard";
import { fail, guardFailure, notFound, ok, readJson, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { packageSchema, toFieldErrors } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const guard = await requireApiAdmin();
    if (!guard.ok) return guardFailure(guard.status);

    const parsed = packageSchema.partial().safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }

    const { id } = await params;
    if (parsed.data.slug) {
      const clash = await prisma.creditPackage.findFirst({
        where: { slug: parsed.data.slug, id: { not: id } },
        select: { id: true },
      });
      if (clash) {
        return fail("A package with this slug already exists.", 409, {
          slug: ["A package with this slug already exists."],
        });
      }
    }

    const updated = await prisma.creditPackage.updateMany({
      where: { id },
      data: parsed.data,
    });
    if (updated.count === 0) return notFound("Package not found.");

    return ok();
  } catch (cause) {
    return serverError("update-package", cause);
  }
}

/**
 * Packages are retired rather than deleted once they have been bought, so the
 * payment history keeps pointing at something real.
 */
export async function DELETE(_request: Request, { params }: Context) {
  try {
    const guard = await requireApiAdmin();
    if (!guard.ok) return guardFailure(guard.status);

    const { id } = await params;
    const sold = await prisma.payment.count({ where: { packageId: id } });

    if (sold > 0) {
      const retired = await prisma.creditPackage.updateMany({
        where: { id },
        data: { active: false },
      });
      if (retired.count === 0) return notFound("Package not found.");
      return ok({ retired: true });
    }

    const deleted = await prisma.creditPackage.deleteMany({ where: { id } });
    if (deleted.count === 0) return notFound("Package not found.");

    return ok({ retired: false });
  } catch (cause) {
    return serverError("delete-package", cause);
  }
}
