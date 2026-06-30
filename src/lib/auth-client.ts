import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "@/lib/auth";

/**
 * Browser-side Better Auth client. `inferAdditionalFields<typeof auth>()` makes
 * the extra User fields (firstName/lastName/phone/role) type-safe on the client.
 *
 * Only the TYPE of `auth` is imported, so no server-only code (Prisma, Resend)
 * is bundled into the client. Base URL defaults to the current origin.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
