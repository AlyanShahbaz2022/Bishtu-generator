import Link from "next/link";

import { siteConfig } from "@/constants/site";

/**
 * Centered, brand-styled shell for all authentication routes
 * (login, register, verify-email, forgot/reset password).
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-accent"
          >
            {siteConfig.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Premium industrial power solutions
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
