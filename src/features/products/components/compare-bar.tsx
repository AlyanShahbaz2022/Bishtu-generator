"use client";

import { GitCompare, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCompare } from "@/features/products/use-compare";

/** Floating bar summarising the current compare selection. Hidden when empty. */
export function CompareBar() {
  const { slugs, count, clear } = useCompare();

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card py-2 pr-2 pl-5 shadow-xl">
        <span className="flex items-center gap-2 text-sm font-medium">
          <GitCompare className="size-4 text-primary" />
          {count} selected
        </span>
        <Button asChild size="sm">
          <Link href={`/compare?slugs=${slugs.join(",")}`}>Compare</Link>
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Clear comparison"
          onClick={clear}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
