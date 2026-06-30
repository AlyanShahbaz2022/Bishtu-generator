import { getCookieCache, getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/lib/env";

/**
 * Edge/server proxy (Next.js 16 — formerly `middleware`). Runs on the Node.js
 * runtime by default.
 *
 * RBAC route guarding (Phase 2):
 *  - Authenticated users are bounced away from /login and /register.
 *  - PROTECTED routes require a session cookie, else redirect to /login.
 *  - ADMIN routes additionally require an admin role, read optimistically from
 *    the signed session-cache cookie (no DB hit). The admin layout re-verifies
 *    server-side, since the cookie cache may be absent/stale (Next.js advises
 *    treating proxy auth as optimistic — see proxy.md "Data Security").
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/orders",
  "/wishlist",
  "/profile",
  "/addresses",
];
const ADMIN_PREFIXES = ["/admin"];
const AUTH_PAGES = ["/login", "/register"];
const ADMIN_ROLES = new Set(["admin", "super-admin"]);

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = Boolean(getSessionCookie(request));

  // Signed-in users shouldn't see the auth pages.
  if (isAuthed && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isAdminRoute = matches(pathname, ADMIN_PREFIXES);
  const needsAuth = isAdminRoute || matches(pathname, PROTECTED_PREFIXES);

  if (needsAuth && !isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && isAuthed) {
    const cached = await getCookieCache(request, {
      secret: env.BETTER_AUTH_SECRET,
    });
    const role = (cached?.user as { role?: string } | undefined)?.role;
    // Only redirect when we can positively read a non-admin role; otherwise let
    // the server-side admin layout make the authoritative decision.
    if (role && !ADMIN_ROLES.has(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/profile/:path*",
    "/addresses/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
