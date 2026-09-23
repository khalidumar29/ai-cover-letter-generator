import { hashPassword } from "@/lib/auth/password";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { endSession } from "@/lib/auth/session";
import { consumeToken, PASSWORD_RESET } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import { passwordChangedEmail } from "@/lib/email/templates";
import { fail, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema, toFieldErrors } from "@/lib/validation";

const EXPIRED = "This reset link has expired. Request a new one to continue.";
const INVALID = "This reset link is not valid. Request a new one to continue.";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`reset:${clientIp(request)}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const parsed = resetPasswordSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }
    const { token, password } = parsed.data;

    const result = await consumeToken(token, PASSWORD_RESET);
    if (!result.ok) {
      return fail(result.reason === "expired" ? EXPIRED : INVALID, result.reason === "expired" ? 410 : 400);
    }

    const now = new Date();
    const user = await prisma.user.update({
      where: { id: result.userId },
      data: {
        passwordHash: await hashPassword(password),
        passwordChangedAt: now,
        emailVerifiedAt: { set: now },
      },
      select: { id: true, name: true, email: true },
    });

    await prisma.authToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: now },
    });

    await endSession();

    try {
      const message = passwordChangedEmail(user.name);
      await sendEmail({
        to: user.email,
        toName: user.name,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
    } catch (cause) {
      console.error("[reset-password] notification failed", cause);
    }

    return ok();
  } catch (cause) {
    return serverError("reset-password", cause);
  }
}
