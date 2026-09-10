/**
 * Guards against open redirects: only same-site absolute paths are allowed
 * back out of the `?next=` parameter.
 */
export function safeNextPath(value: string | undefined, fallback = "/dashboard"): string {
  if (!value) return fallback;
  // "//host" and "/\host" are protocol-relative URLs pointing off-site.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
