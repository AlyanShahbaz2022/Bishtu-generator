"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function VerifyEmailCard({ email }: { email?: string }) {
  const [loading, setLoading] = useState(false);

  async function resend() {
    if (!email) {
      toast.error("Missing email address — please sign in again.");
      return;
    }
    setLoading(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Could not resend the email");
      return;
    }
    toast.success("Verification email sent.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          {email ? (
            <>
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Click it to activate your account.
            </>
          ) : (
            "We sent you a verification link. Click it to activate your account."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={resend}
          disabled={loading}
        >
          {loading ? "Sending…" : "Resend verification email"}
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
