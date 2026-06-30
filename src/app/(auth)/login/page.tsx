import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

/** Only permit relative, single-slash callback paths (prevents open redirects). */
function safeCallback(value?: string): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const googleEnabled = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );
  return (
    <LoginForm
      callbackURL={safeCallback(callbackUrl)}
      googleEnabled={googleEnabled}
    />
  );
}
