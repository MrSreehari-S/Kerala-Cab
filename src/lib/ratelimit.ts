/**
 * Rate limiting for the login endpoint.
 *
 * Uses a lightweight in-process Map — no external service required.
 * Limits are enforced with a fixed sliding window per key.
 *
 * Limits (sliding window):
 *  - Per IP   : 5 attempts / 15 minutes
 *  - Per email: 10 attempts / 15 minutes  (guards against NAT / shared IPs)
 *
 * Note: State resets on server restart. This is acceptable for a
 * single-server / VPS deployment. For multi-instance deployments,
 * swap the Map for a shared store (Redis, etc.).
 */

// ── Constants ─────────────────────────────────────────────────────────────────
const IP_LIMIT = 5;
const EMAIL_LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// ── In-memory store ───────────────────────────────────────────────────────────
interface MemWindow {
  count: number;
  resetAt: number; // ms timestamp
}

const memStore = new Map<string, MemWindow>();

function checkMemLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = memStore.get(key);

  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetAt,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
export interface RateLimitResult {
  success: boolean;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Requests remaining before throttling */
  remaining: number;
  /** Unix timestamp (ms) when the window resets */
  reset: number;
}

/**
 * Check both the per-IP and per-email rate limits.
 * Returns the most restrictive result (whichever bucket is closest to the limit).
 */
export async function checkLoginRateLimit(
  ip: string,
  email: string
): Promise<RateLimitResult> {
  const ipResult = checkMemLimit(`ip:${ip}`, IP_LIMIT, WINDOW_MS);
  const emailResult = checkMemLimit(`email:${email.toLowerCase()}`, EMAIL_LIMIT, WINDOW_MS);

  // If either bucket is exhausted, deny
  if (!ipResult.success) return ipResult;
  if (!emailResult.success) return emailResult;

  // Both passed — return combined remaining (most restrictive)
  return {
    success: true,
    limit: IP_LIMIT,
    remaining: Math.min(ipResult.remaining, emailResult.remaining),
    reset: Math.max(ipResult.reset, emailResult.reset),
  };
}
