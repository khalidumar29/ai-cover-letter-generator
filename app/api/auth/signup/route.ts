import { hashPassword } from "@/lib/auth/password";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { startSession } from "@/lib/auth/session";
import { EMAIL_VERIFICATION, issueToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import { verificationEmail } from "@/lib/email/templates";
import { CREDIT_REASONS } from "@/lib/domain";
import { fail, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { signupSchema, toFieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`signup:${clientIp(request)}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const parsed = signupSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return fail("An account with this email already exists.", 409, {
        email: ["An account with this email already exists."],
      });
    }

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
      select: { id: true, name: true, email: true, role: true, credits: true },
    });

    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        delta: user.credits,
        reason: CREDIT_REASONS.SIGNUP_BONUS,
        description: "Free credits for creating an account",
        balanceAfter: user.credits,
      },
    });

    await startSession(user);

    let emailSent = true;
    try {
      const token = await issueToken(user.id, EMAIL_VERIFICATION);
      const message = verificationEmail(user.name, token);
      await sendEmail({
        to: user.email,
        toName: user.name,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
    } catch (cause) {
      console.error("[signup] verification email failed", cause);
      emailSent = false;
    }

    return ok({ emailSent, email: user.email }, 201);
  } catch (cause) {
    return serverError("signup", cause);
  }
}
