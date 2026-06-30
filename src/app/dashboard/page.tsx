import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getServerSession } from "@/lib/auth-session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const { user } = session;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/orders">My orders</Link>
          </Button>
          <SignOutButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role ?? "customer"} />
          <Row
            label="Email verified"
            value={user.emailVerified ? "Yes" : "No"}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
