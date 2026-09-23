import { requireApiAdmin } from "@/lib/auth/guard";
import { fail, guardFailure, ok, readJson, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { packageSchema, toFieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const guard = await requireApiAdmin();
    if (!guard.ok) return guardFailure(guard.status);

    const parsed = packageSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }

    const existing = await prisma.creditPackage.findUnique({
      where: { slug: parsed.data.slug },
      select: { id: true },
    });
    if (existing) {
      return fail("A package with this slug already exists.", 409, {
        slug: ["A package with this slug already exists."],
      });
    }

    const created = await prisma.creditPackage.create({ data: parsed.data });
    return ok({ package: created }, 201);
  } catch (cause) {
    return serverError("create-package", cause);
  }
}
