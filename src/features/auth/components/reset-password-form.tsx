"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { fieldErrors, resetPasswordSchema } from "@/features/auth/schemas";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({
  token,
  invalidToken,
}: {
  token?: string;
  invalidToken: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const form = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: parsed.data.password,
      token,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Could not reset your password");
      return;
    }

    toast.success("Password updated — please sign in.");
    router.push("/login");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>
          {invalidToken
            ? "This reset link is invalid or has expired."
            : "Enter a new password for your account."}
        </CardDescription>
      </CardHeader>
      {invalidToken ? (
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardContent>
      ) : (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
              />
              <FieldError message={errors.password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
              />
              <FieldError message={errors.confirmPassword} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
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
