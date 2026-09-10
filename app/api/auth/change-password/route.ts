import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { getCurrentUser, startSession } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/brevo";
import { passwordChangedEmail } from "@/lib/email/templates";
import { fail, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema, toFieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return fail("Not authenticated.", 401);

    const limit = rateLimit(`change-password:${currentUser.id}:${clientIp(request)}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const parsed = changePasswordSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }
    const { currentPassword, password } = parsed.data;

    const account = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, name: true, email: true, role: true, passwordHash: true },
    });
    if (!account) return fail("Not authenticated.", 401);

    if (!(await verifyPassword(currentPassword, account.passwordHash))) {
      return fail("Your current password is incorrect.", 400, {
        currentPassword: ["Your current password is incorrect."],
      });
    }

    await prisma.user.update({
      where: { id: account.id },
      data: {
        passwordHash: await hashPassword(password),
        // Signs out every other device.
        passwordChangedAt: new Date(),
      },
    });

    // Re-issue this device's session so the user is not logged out mid-flow.
    await startSession(account);

    try {
      const message = passwordChangedEmail(account.name);
      await sendEmail({
        to: account.email,
        toName: account.name,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
    } catch (cause) {
      console.error("[change-password] notification failed", cause);
    }

    return ok();
  } catch (cause) {
    return serverError("change-password", cause);
  }
}
