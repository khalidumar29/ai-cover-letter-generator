export type ApiSuccess = { ok: true } & Record<string, unknown>;
export type ApiFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};
export type ApiResult = ApiSuccess | ApiFailure;

/** Posts JSON to an auth endpoint and normalises every failure mode. */
export async function postJson(url: string, body: unknown): Promise<ApiResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => null)) as ApiResult | null;
    if (data && typeof data.ok === "boolean") return data;

    return { ok: false, error: `Unexpected response (${response.status}).` };
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." };
  }
}

/** First error message for a field, if the server returned one. */
export function fieldError(
  result: ApiResult | null,
  field: string,
): string | undefined {
  if (!result || result.ok) return undefined;
  return result.fieldErrors?.[field]?.[0];
}
