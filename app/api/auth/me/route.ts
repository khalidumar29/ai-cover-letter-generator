import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Not authenticated.", 401);

    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        emailVerified: user.emailVerifiedAt !== null,
      },
    });
  } catch (cause) {
    return serverError("me", cause);
  }
}
