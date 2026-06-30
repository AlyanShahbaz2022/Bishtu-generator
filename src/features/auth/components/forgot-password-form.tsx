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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/features/auth/components/form-bits";
import { fieldErrors, forgotPasswordSchema } from "@/features/auth/schemas";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({
      email: String(form.get("email") ?? "").trim(),
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email: parsed.data.email,
      redirectTo: "/reset-password",
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Something went wrong");
      return;
    }
    // Don't reveal whether the email exists.
    setSent(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          {sent
            ? "If an account exists for that email, a reset link is on its way."
            : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>
      {!sent && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
              />
              <FieldError message={errors.email} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        </CardContent>
      )}
      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm text-accent hover:underline">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
