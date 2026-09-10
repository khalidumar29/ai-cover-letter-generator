import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { issueToken, PASSWORD_RESET } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import { passwordResetEmail } from "@/lib/email/templates";
import { fail, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { emailOnlySchema, toFieldErrors } from "@/lib/validation";

// Same response for a known and an unknown address.
const GENERIC =
  "If an account exists for that address, we've sent a password reset link.";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`forgot:${clientIp(request)}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const parsed = emailOnlySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Enter a valid email address.", 422, toFieldErrors(parsed.error));
    }
    const { email } = parsed.data;

    const accountLimit = rateLimit(`forgot:email:${email}`, 3, 15 * 60 * 1000);
    // Silently succeed rather than 429 here: a distinct response would confirm
    // that the address is registered.
    if (!accountLimit.allowed) return ok({ message: GENERIC });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      const token = await issueToken(user.id, PASSWORD_RESET);
      const message = passwordResetEmail(user.name, token);
      try {
        await sendEmail({
          to: user.email,
          toName: user.name,
          subject: message.subject,
          html: message.html,
          text: message.text,
        });
      } catch (cause) {
        // Keep the response generic even when delivery fails.
        console.error("[forgot-password] delivery failed", cause);
      }
    }

    return ok({ message: GENERIC });
  } catch (cause) {
    return serverError("forgot-password", cause);
  }
}
