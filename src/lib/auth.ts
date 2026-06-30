import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/lib/env";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * Better Auth server instance (Phase 2 — Authentication & RBAC).
 *
 * - Email/password with mandatory email verification + password reset.
 * - Google OAuth (enabled only when credentials are present).
 * - Prisma adapter over PostgreSQL; User/Session/Account/Verification live in
 *   `prisma/schema.prisma`.
 * - Domain fields (firstName/lastName/phone/role) are exposed as
 *   `additionalFields`. `role` is server-controlled (`input: false`) and mirrors
 *   the Role table name; `session.cookieCache` carries it for cheap RBAC reads
 *   in `proxy.ts`.
 */
const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, name: user.name, url });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, name: user.name, url });
    },
  },

  ...(googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
          },
        },
      }
    : {}),

  user: {
    additionalFields: {
      // Collected by the email registration form (enforced there via Zod);
      // optional here so social sign-ups (no name split) don't fail.
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      phone: { type: "string", required: false },
      // Server-controlled role-name fast path. Never user-settable at signup.
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },

  session: {
    // Sign the session (incl. user.role) into a short-lived cookie so the proxy
    // can authorize without a DB round-trip.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  // nextCookies() must be the last plugin so Set-Cookie headers propagate
  // through Next.js server actions / route handlers.
  plugins: [nextCookies()],
});
