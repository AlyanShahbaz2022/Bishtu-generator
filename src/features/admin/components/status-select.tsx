"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/** Inline status dropdown that calls a bound server action and refreshes. */
export function StatusSelect({
  value,
  options,
  action,
}: {
  value: string;
  options: string[];
  action: (next: string) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        start(async () => {
          try {
            await action(next);
            toast.success("Status updated");
            router.refresh();
          } catch {
            toast.error("Update failed");
          }
        });
      }}
      className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.charAt(0) + o.slice(1).toLowerCase().replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
