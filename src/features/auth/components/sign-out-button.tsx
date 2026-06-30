"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await authClient.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
}
