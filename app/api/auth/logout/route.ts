import { endSession } from "@/lib/auth/session";
import { ok, serverError } from "@/lib/http";

export async function POST() {
  try {
    await endSession();
    return ok();
  } catch (cause) {
    return serverError("logout", cause);
  }
}
