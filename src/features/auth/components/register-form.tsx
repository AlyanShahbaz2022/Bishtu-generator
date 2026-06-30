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
import { FieldError, Separator } from "@/features/auth/components/form-bits";
import { GoogleButton } from "@/features/auth/components/google-button";
import { fieldErrors, registerSchema } from "@/features/auth/schemas";
import { authClient } from "@/lib/auth-client";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    };

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setLoading(true);
    const { firstName, lastName, email, phone, password } = parsed.data;
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      phone: phone || undefined,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message ?? "Could not create your account");
      return;
    }

    toast.success("Account created — check your email to verify.");
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join {`Tech & Tune`} to order, request quotes, and track service.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
              />
              <FieldError message={errors.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" autoComplete="family-name" />
              <FieldError message={errors.lastName} />
            </div>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" />
            <FieldError message={errors.phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        {googleEnabled && (
          <>
            <Separator />
            <GoogleButton />
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
