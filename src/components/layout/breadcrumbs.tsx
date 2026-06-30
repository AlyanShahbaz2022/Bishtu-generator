import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type Crumb = { title: string; href?: string };

/**
 * Accessible breadcrumb trail. Pass an ordered list of crumbs; the last item is
 * rendered as the current page (no link).
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        <li>
          <Link href="/" className="flex items-center hover:text-foreground">
            <Home className="size-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.title}-${index}`}
              className="flex items-center gap-1.5"
            >
              <ChevronRight className="size-3.5" />
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.title}
                </Link>
              ) : (
                <span
                  className={cn(isLast && "font-medium text-foreground")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
