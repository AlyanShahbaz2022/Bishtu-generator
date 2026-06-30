"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefFor(target: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (target <= 1) next.delete("page");
    else next.set("page", String(target));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <Button
        asChild={page > 1}
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={page <= 1}
      >
        {page > 1 ? (
          <Link href={hrefFor(page - 1)}>
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="size-4" />
          </span>
        )}
      </Button>

      {pages.map((p) => (
        <Button
          key={p}
          asChild
          variant={p === page ? "default" : "outline"}
          size="icon"
          aria-current={p === page ? "page" : undefined}
          className={cn(p === page && "pointer-events-none")}
        >
          <Link href={hrefFor(p)}>{p}</Link>
        </Button>
      ))}

      <Button
        asChild={page < totalPages}
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={page >= totalPages}
      >
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="size-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
