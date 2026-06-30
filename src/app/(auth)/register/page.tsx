import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  const googleEnabled = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );
  return <RegisterForm googleEnabled={googleEnabled} />;
}
