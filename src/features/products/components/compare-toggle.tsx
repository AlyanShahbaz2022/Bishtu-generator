"use client";

import { GitCompare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MAX_COMPARE, useCompare } from "@/features/products/use-compare";
import { cn } from "@/lib/utils";

export function CompareToggle({ slug, name }: { slug: string; name: string }) {
  const { has, isFull, toggle } = useCompare();
  const active = has(slug);

  function onClick() {
    if (!active && isFull) {
      toast.error(`You can compare up to ${MAX_COMPARE} products.`);
      return;
    }
    toggle(slug);
    toast.success(
      active ? `Removed ${name} from compare` : `Added ${name} to compare`,
    );
  }

  return (
    <Button
      size="icon"
      variant={active ? "default" : "secondary"}
      aria-label={
        active ? `Remove ${name} from compare` : `Add ${name} to compare`
      }
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "absolute top-3 right-13 shadow-md transition-opacity",
        active
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
      )}
    >
      <GitCompare className="size-4" />
    </Button>
  );
}
