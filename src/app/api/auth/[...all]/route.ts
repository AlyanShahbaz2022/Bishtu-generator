import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

/**
 * Better Auth catch-all route handler. Serves every `/api/auth/*` endpoint
 * (sign-in, sign-up, verify-email, reset-password, OAuth callbacks, …).
 */
export const { GET, POST } = toNextJsHandler(auth.handler);
