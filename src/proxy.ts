import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "klrcab-admin-token";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod"
);

/**
 * Protect /admin routes (except the login page and auth API endpoints).
 * Next.js 16: file renamed from middleware.ts → proxy.ts
 *             exported function renamed from `middleware` → `proxy`
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page & auth API routes through
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Check for a valid JWT cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    // Token expired or tampered — clear it and redirect
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
