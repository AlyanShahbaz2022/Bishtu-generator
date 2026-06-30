import { headers } from "next/headers";

import { auth } from "@/lib/auth";

/**
 * Server-side session reader for Server Components, Route Handlers, and Server
 * Actions. Returns `{ user, session }` or `null`. This is the authoritative
 * check — `proxy.ts` only performs an optimistic cookie-based guard.
 */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}
