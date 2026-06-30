"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FilterOptions = {
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
  fuelTypes: string[];
};

export function ProductFilters({
  options,
  hideCategories = false,
  hideBrands = false,
}: {
  options: FilterOptions;
  hideCategories?: boolean;
  hideBrands?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = (key: string) =>
    searchParams.get(key)?.split(",").filter(Boolean) ?? [];

  function commit(next: URLSearchParams) {
    next.delete("page"); // any filter change returns to page 1
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggle(key: string, value: string) {
    const current = selected(key);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const next = new URLSearchParams(searchParams.toString());
    if (updated.length) next.set(key, updated.join(","));
    else next.delete(key);
    commit(next);
  }

  function setRange(form: FormData) {
    const next = new URLSearchParams(searchParams.toString());
    for (const key of ["minKva", "maxKva", "minPrice", "maxPrice"]) {
      const value = String(form.get(key) ?? "").trim();
      if (value) next.set(key, value);
      else next.delete(key);
    }
    commit(next);
  }

  const hasActiveFilters = [
    "category",
    "brand",
    "fuel",
    "minKva",
    "maxKva",
    "minPrice",
    "maxPrice",
    "q",
  ].some((k) => searchParams.has(k));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="link"
            size="sm"
            className="h-auto px-0"
            onClick={() => router.push(pathname)}
          >
            Clear all
          </Button>
        )}
      </div>

      {!hideCategories && options.categories.length > 0 && (
        <FilterGroup title="Category">
          {options.categories.map((c) => (
            <CheckRow
              key={c.slug}
              label={c.name}
              checked={selected("category").includes(c.slug)}
              onChange={() => toggle("category", c.slug)}
            />
          ))}
        </FilterGroup>
      )}

      {!hideBrands && options.brands.length > 0 && (
        <FilterGroup title="Brand">
          {options.brands.map((b) => (
            <CheckRow
              key={b.slug}
              label={b.name}
              checked={selected("brand").includes(b.slug)}
              onChange={() => toggle("brand", b.slug)}
            />
          ))}
        </FilterGroup>
      )}

      {options.fuelTypes.length > 0 && (
        <FilterGroup title="Fuel type">
          {options.fuelTypes.map((f) => (
            <CheckRow
              key={f}
              label={f.charAt(0) + f.slice(1).toLowerCase()}
              checked={selected("fuel").includes(f)}
              onChange={() => toggle("fuel", f)}
            />
          ))}
        </FilterGroup>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setRange(new FormData(e.currentTarget));
        }}
        className="space-y-4"
      >
        <FilterGroup title="Power (KVA)">
          <div className="flex items-center gap-2">
            <RangeInput
              name="minKva"
              placeholder="Min"
              defaultValue={searchParams.get("minKva")}
            />
            <span className="text-muted-foreground">–</span>
            <RangeInput
              name="maxKva"
              placeholder="Max"
              defaultValue={searchParams.get("maxKva")}
            />
          </div>
        </FilterGroup>

        <FilterGroup title="Price (PKR)">
          <div className="flex items-center gap-2">
            <RangeInput
              name="minPrice"
              placeholder="Min"
              defaultValue={searchParams.get("minPrice")}
            />
            <span className="text-muted-foreground">–</span>
            <RangeInput
              name="maxPrice"
              placeholder="Max"
              defaultValue={searchParams.get("maxPrice")}
            />
          </div>
        </FilterGroup>

        <Button type="submit" variant="outline" size="sm" className="w-full">
          Apply ranges
        </Button>
      </form>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded accent-primary"
      />
      {label}
    </label>
  );
}

function RangeInput({
  name,
  placeholder,
  defaultValue,
}: {
  name: string;
  placeholder: string;
  defaultValue: string | null;
}) {
  return (
    <>
      <Label htmlFor={name} className="sr-only">
        {placeholder}
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        inputMode="numeric"
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="h-9"
      />
    </>
  );
}
