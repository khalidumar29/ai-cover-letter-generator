import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { EMAIL_VERIFICATION, issueToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/brevo";
import { verificationEmail } from "@/lib/email/templates";
import { fail, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { emailOnlySchema } from "@/lib/validation";

const GENERIC =
  "If that address needs confirming, a new link is on its way.";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`resend:${clientIp(request)}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const currentUser = await getCurrentUser();
    let email = currentUser?.email ?? null;

    if (!email) {
      const parsed = emailOnlySchema.safeParse(await readJson(request));
      if (!parsed.success) return fail("Enter a valid email address.", 422);
      email = parsed.data.email;
    }

    const accountLimit = rateLimit(`resend:email:${email}`, 3, 15 * 60 * 1000);
    if (!accountLimit.allowed) return tooManyRequests(accountLimit.retryAfter);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, emailVerifiedAt: true },
    });

    if (user && !user.emailVerifiedAt) {
      const token = await issueToken(user.id, EMAIL_VERIFICATION);
      const message = verificationEmail(user.name, token);
      await sendEmail({
        to: user.email,
        toName: user.name,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
    }

    return ok({ message: GENERIC });
  } catch (cause) {
    return serverError("resend-verification", cause);
  }
}
