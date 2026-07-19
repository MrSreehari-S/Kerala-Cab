/**
 * Rate limiting for the login endpoint.
 *
 * Uses @upstash/ratelimit with Redis when UPSTASH credentials are present.
 * Falls back to a lightweight in-process Map for local development so the
 * rest of the app never breaks when Redis is not configured.
 *
 * Production limits (sliding window):
 *  - Per IP   : 5 attempts / 15 minutes
 *  - Per email: 10 attempts / 15 minutes  (guards against NAT / shared IPs)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Constants ─────────────────────────────────────────────────────────────────
const IP_LIMIT = 5;
const IP_WINDOW = "15 m";

const EMAIL_LIMIT = 10;
const EMAIL_WINDOW = "15 m";

// ── Upstash singletons (lazy init) ────────────────────────────────────────────
let ipLimiter: Ratelimit | null = null;
let emailLimiter: Ratelimit | null = null;

function isRedisConfigured(): boolean {
  return (
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

function getIpLimiter(): Ratelimit {
  if (!ipLimiter) {
    ipLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(IP_LIMIT, IP_WINDOW),
      prefix: "@keralacabs/login:ip",
      analytics: true,
    });
  }
  return ipLimiter;
}

function getEmailLimiter(): Ratelimit {
  if (!emailLimiter) {
    emailLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(EMAIL_LIMIT, EMAIL_WINDOW),
      prefix: "@keralacabs/login:email",
      analytics: true,
    });
  }
  return emailLimiter;
}

// ── In-memory fallback (dev only) ─────────────────────────────────────────────
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
  // ── Dev fallback ─────────────────────────────────────────────────────────
  if (!isRedisConfigured()) {
    const windowMs = 15 * 60 * 1000;
    const ipResult = checkMemLimit(`ip:${ip}`, IP_LIMIT, windowMs);
    const emailResult = checkMemLimit(`email:${email}`, EMAIL_LIMIT, windowMs);
    // Return the more restrictive result
    return ipResult.success && emailResult.success
      ? { ...ipResult, remaining: Math.min(ipResult.remaining, emailResult.remaining) }
      : (!ipResult.success ? ipResult : emailResult);
  }

  // ── Production: Upstash Redis ─────────────────────────────────────────────
  const [ipResult, emailResult] = await Promise.all([
    getIpLimiter().limit(ip),
    getEmailLimiter().limit(email.toLowerCase()),
  ]);

  // If either bucket is exhausted, deny
  if (!ipResult.success) {
    return {
      success: false,
      limit: ipResult.limit,
      remaining: 0,
      reset: ipResult.reset,
    };
  }
  if (!emailResult.success) {
    return {
      success: false,
      limit: emailResult.limit,
      remaining: 0,
      reset: emailResult.reset,
    };
  }

  // Both passed — return combined remaining
  return {
    success: true,
    limit: IP_LIMIT,
    remaining: Math.min(ipResult.remaining, emailResult.remaining),
    reset: Math.max(ipResult.reset, emailResult.reset),
  };
}
