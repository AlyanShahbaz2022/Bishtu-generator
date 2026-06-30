"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Newsletter signup. Wiring to Resend/DB lands in Phase 8 — for now it
 * validates and confirms optimistically.
 */
export function NewsletterForm() {
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    // TODO(Phase 8): persist + send confirmation via Resend.
    setTimeout(() => {
      setLoading(false);
      form.reset();
      toast.success("Subscribed — thanks for joining!");
    }, 400);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        name="email"
        type="email"
        placeholder="Your email"
        aria-label="Email address"
        className="bg-background/50"
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Subscribe"
        disabled={loading}
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
