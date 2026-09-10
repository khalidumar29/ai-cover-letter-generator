/**
 * Fixed-window rate limiter held in process memory.
 *
 * This is enough to blunt password guessing and inbox flooding on a single
 * server, which is the scope of this project. It does not survive a restart
 * and is not shared between instances — swap in Redis or the database before
 * running more than one process.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Drop expired buckets occasionally so the map cannot grow without bound.
const SWEEP_EVERY = 500;
let writesSinceSweep = 0;

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets, for the Retry-After header. */
  retryAfter: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (++writesSinceSweep >= SWEEP_EVERY) sweep(now);
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

function sweep(now: number): void {
  writesSinceSweep = 0;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Best-effort client identifier. Behind a proxy Next.js does not expose the
 * socket address, so fall back to the forwarding headers.
 */
export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
