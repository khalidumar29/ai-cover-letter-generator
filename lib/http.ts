import { NextResponse } from "next/server";

export type FieldErrors = Record<string, string[]>;

export function ok<T extends object>(data: T = {} as T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function fail(message: string, status = 400, fieldErrors?: FieldErrors) {
  return NextResponse.json(
    { ok: false, error: message, ...(fieldErrors ? { fieldErrors } : {}) },
    { status },
  );
}

export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { ok: false, error: "Too many attempts. Please wait and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

export function serverError(context: string, cause: unknown) {
  console.error(`[${context}]`, cause);
  return NextResponse.json(
    { ok: false, error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}

export function guardFailure(status: 401 | 403) {
  return status === 401
    ? fail("Not authenticated.", 401)
    : fail("You do not have access to this.", 403);
}

export function notFound(message = "Not found.") {
  return fail(message, 404);
}
