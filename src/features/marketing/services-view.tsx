"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SERVICE_TABS,
  type ServiceTab,
} from "@/features/marketing/services-content";

export function ServicesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requested = searchParams.get("tab");
  const active: ServiceTab =
    SERVICE_TABS.find((t) => t.id === requested) ?? SERVICE_TABS[0];

  function selectTab(id: ServiceTab["id"]) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mt-10">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Services"
        className="flex flex-wrap gap-2 border-b border-border"
      >
        {SERVICE_TABS.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => selectTab(tab.id)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active tab panel */}
      <div role="tabpanel" className="grid gap-8 pt-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {active.headline}
          </h2>
          <p className="mt-3 text-muted-foreground">{active.intro}</p>
          <Button asChild className="mt-6">
            <Link href={active.ctaHref}>
              {active.ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <ul className="space-y-3 rounded-2xl border border-border bg-secondary/30 p-6">
          {active.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
