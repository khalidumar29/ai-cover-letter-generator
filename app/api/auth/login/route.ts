import { burnTiming, verifyPassword } from "@/lib/auth/password";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { startSession } from "@/lib/auth/session";
import { fail, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { loginSchema, toFieldErrors } from "@/lib/validation";

const GENERIC_FAILURE = "Invalid email or password.";

export async function POST(request: Request) {
  try {
    const ipLimit = rateLimit(`login:ip:${clientIp(request)}`, 20, 15 * 60 * 1000);
    if (!ipLimit.allowed) return tooManyRequests(ipLimit.retryAfter);

    const parsed = loginSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }
    const { email, password } = parsed.data;

    const accountLimit = rateLimit(`login:email:${email}`, 10, 15 * 60 * 1000);
    if (!accountLimit.allowed) return tooManyRequests(accountLimit.retryAfter);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      await burnTiming(password);
      return fail(GENERIC_FAILURE, 401);
    }

    if (!(await verifyPassword(password, user.passwordHash))) {
      return fail(GENERIC_FAILURE, 401);
    }

    await startSession(user);

    return ok({ emailVerified: user.emailVerifiedAt !== null });
  } catch (cause) {
    return serverError("login", cause);
  }
}
