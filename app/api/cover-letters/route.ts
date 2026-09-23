import { requireApiUser } from "@/lib/auth/guard";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { generateAndSave, InsufficientCreditsError } from "@/lib/cover-letters";
import { fail, guardFailure, ok, readJson, serverError, tooManyRequests } from "@/lib/http";
import { generateLetterSchema, toFieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const guard = await requireApiUser();
    if (!guard.ok) return guardFailure(guard.status);
    const { user } = guard;

    // Generation is the expensive call in the product. The credit balance is
    // the real limit; this only stops one account from hammering the model.
    const limit = rateLimit(`generate:${user.id}`, 20, 60 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter);

    const burst = rateLimit(`generate-ip:${clientIp(request)}`, 40, 60 * 60 * 1000);
    if (!burst.allowed) return tooManyRequests(burst.retryAfter);

    const parsed = generateLetterSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", 422, toFieldErrors(parsed.error));
    }

    const result = await generateAndSave({ user, input: parsed.data });
    return ok(result, 201);
  } catch (cause) {
    if (cause instanceof InsufficientCreditsError) {
      return fail("You are out of credits. Top up to keep generating.", 402);
    }
    return serverError("generate-cover-letter", cause);
  }
}
