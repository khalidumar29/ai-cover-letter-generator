import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { consumeToken, EMAIL_VERIFICATION } from "@/lib/auth/tokens";
import { fail, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toFieldErrors, verifyTokenSchema } from "@/lib/validation";

const EXPIRED =
  "This confirmation link has expired. Request a new one and try again.";
const INVALID =
  "This confirmation link is not valid. Request a new one and try again.";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`verify:${clientIp(request)}`, 20, 15 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const parsed = verifyTokenSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail(INVALID, 422, toFieldErrors(parsed.error));
    }

    const result = await consumeToken(parsed.data.token, EMAIL_VERIFICATION);
    if (!result.ok) {
      if (result.reason === "expired") return fail(EXPIRED, 410);
      // A "used" token most often means the user clicked the link twice, or a
      // mail scanner opened it first. Treat that as already-verified below.
      if (result.reason === "used") {
        return ok({ alreadyVerified: true });
      }
      return fail(INVALID, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: { emailVerifiedAt: true },
    });
    if (!user) return fail(INVALID, 400);

    if (!user.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: result.userId },
        data: { emailVerifiedAt: new Date() },
      });
    }

    return ok({ alreadyVerified: user.emailVerifiedAt !== null });
  } catch (cause) {
    return serverError("verify-email", cause);
  }
}
