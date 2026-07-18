import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { checkLoginRateLimit } from "@/lib/ratelimit";

/**
 * Resolve the caller's real IP from standard proxy headers.
 * Vercel sets x-forwarded-for; other hosts may use x-real-ip.
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export async function POST(request: NextRequest) {
  // ── Parse body early so we have the email for per-account limiting ─────────
  let email = "";
  let password = "";

  try {
    const body = await request.json();
    email = (body.email ?? "").toString().trim();
    password = (body.password ?? "").toString();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // ── Rate limit check (before bcrypt — saves CPU on brute-force) ───────────
  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await checkLoginRateLimit(ip, email);

  // Standard rate-limit headers on every response
  const rlHeaders = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(reset),
  };

  if (!success) {
    const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      {
        error: "Too many login attempts. Please wait before trying again.",
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          ...rlHeaders,
          "Retry-After": String(retryAfterSec),
        },
      }
    );
  }

  // ── Credential verification ───────────────────────────────────────────────
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne({ email });

    // Constant-time response: always run bcrypt even on unknown email
    // to prevent user-enumeration via timing differences.
    const DUMMY_HASH =
      "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8VNKw4lLSe2nB1Cflv6";
    const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: rlHeaders }
      );
    }

    await createSession(email);

    return NextResponse.json(
      { success: true, email },
      { headers: rlHeaders }
    );
  } catch (error) {
    console.error("[login] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: rlHeaders }
    );
  }
}
