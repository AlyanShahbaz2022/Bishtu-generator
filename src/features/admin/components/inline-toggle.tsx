"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

/**
 * Optimistic on/off switch that calls a bound server action with the desired
 * value. Reverts and toasts on failure.
 */
export function InlineToggle({
  checked,
  action,
  label,
}: {
  checked: boolean;
  action: (next: boolean) => Promise<void>;
  label?: string;
}) {
  const [on, setOn] = useState(checked);
  const [pending, start] = useTransition();

  return (
    <Switch
      checked={on}
      disabled={pending}
      aria-label={label}
      onCheckedChange={(next) => {
        setOn(next);
        start(async () => {
          try {
            await action(next);
          } catch {
            setOn(!next);
            toast.error("Update failed");
          }
        });
      }}
    />
  );
}
