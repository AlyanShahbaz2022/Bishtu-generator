import { headers } from "next/headers";

/**
 * Lightweight in-memory sliding-window rate limiter for public server actions
 * (TRD §20 — Security). Keyed by client IP + action name.
 *
 * NOTE: state lives in the module scope of a single server instance, so on
 * serverless/multi-instance deploys each instance keeps its own counters. This
 * is adequate for MVP abuse-prevention; swap the store for Upstash Redis when
 * durable, distributed limiting is required.
 */
type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

// Opportunistic cleanup so the map doesn't grow unbounded.
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * @param key      Unique bucket key (e.g. `"quote:1.2.3.4"`).
 * @param limit    Max requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    success: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Convenience guard for public form actions: 5 submissions per minute per IP by
 * default. Returns a user-facing error message when the limit is exceeded.
 */
export async function guardFormSubmission(
  action: string,
  opts: { limit?: number; windowMs?: number } = {},
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await getClientIp();
  const { limit = 5, windowMs = 60_000 } = opts;
  const result = rateLimit(`${action}:${ip}`, limit, windowMs);
  if (!result.success) {
    return {
      ok: false,
      error: "Too many submissions. Please wait a moment and try again.",
    };
  }
  return { ok: true };
}
