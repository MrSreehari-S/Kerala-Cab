import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "klrcab-admin-token";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod"
);

export interface AdminPayload extends JWTPayload {
  email: string;
  role: "admin";
}

/** Sign a JWT and set it as an HTTP-only cookie. */
export async function createSession(email: string): Promise<string> {
  const token = await new SignJWT({ email, role: "admin" } satisfies AdminPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

/** Verify a JWT from the cookie or a raw token string.
 *  Returns the payload if valid, or null. */
export async function verifySession(
  token?: string
): Promise<AdminPayload | null> {
  try {
    const raw =
      token ?? (await cookies()).get(COOKIE_NAME)?.value;
    if (!raw) return null;

    const { payload } = await jwtVerify(raw, JWT_SECRET);
    return payload as AdminPayload;
  } catch {
    return null;
  }
}

/** Remove the session cookie. */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Name exported so middleware can reference it. */
export { COOKIE_NAME };
