import "server-only";

import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth-session";

export const ADMIN_ROLES = new Set(["admin", "super-admin"]);

/**
 * Authoritative admin guard for admin pages AND server actions. Redirects
 * non-admins (proxy.ts only does an optimistic cookie check). Returns the
 * session so callers can read the acting user.
 */
export async function requireAdmin() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (!ADMIN_ROLES.has(session.user.role ?? "")) redirect("/");
  return session;
}
