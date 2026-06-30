"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

const controlClass =
  "border-border bg-background h-9 rounded-lg border px-3 text-sm outline-none";

export function AdminProductFilters({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Input
        defaultValue={params.get("q") ?? ""}
        placeholder="Search name or SKU…"
        className="h-9 w-56"
        onKeyDown={(e) => {
          if (e.key === "Enter")
            set("q", (e.target as HTMLInputElement).value.trim());
        }}
      />
      <select
        className={controlClass}
        defaultValue={params.get("category") ?? ""}
        onChange={(e) => set("category", e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        className={controlClass}
        defaultValue={params.get("fuel") ?? ""}
        onChange={(e) => set("fuel", e.target.value)}
      >
        <option value="">All fuels</option>
        <option value="DIESEL">Diesel</option>
        <option value="PETROL">Petrol</option>
        <option value="GAS">Gas</option>
      </select>
      <select
        className={controlClass}
        defaultValue={params.get("status") ?? ""}
        onChange={(e) => set("status", e.target.value)}
      >
        <option value="">Any status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select
        className={controlClass}
        defaultValue={params.get("featured") ?? ""}
        onChange={(e) => set("featured", e.target.value)}
      >
        <option value="">All</option>
        <option value="1">Featured</option>
      </select>
    </div>
  );
}
