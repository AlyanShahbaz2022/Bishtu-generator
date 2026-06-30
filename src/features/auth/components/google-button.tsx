"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function GoogleButton({
  callbackURL = "/dashboard",
}: {
  callbackURL?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
    if (error) {
      toast.error(error.message ?? "Could not sign in with Google");
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={loading}
    >
      <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1h-9.17v2.96h5.27c-.23 1.4-1.64 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.86s2.59-5.86 5.76-5.86c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.99 3.6 14.92 2.7 12.18 2.7 7.27 2.7 3.3 6.67 3.3 11.58s3.97 8.88 8.88 8.88c5.13 0 8.52-3.6 8.52-8.68 0-.58-.06-1.02-.15-1.46z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}
