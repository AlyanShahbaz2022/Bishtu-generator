import type { ProductQuery, ProductSort } from "@/services/products";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const SORTS: ProductSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "kva-asc",
  "kva-desc",
  "name",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

function num(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Parse URL search params into a typed ProductQuery for the catalog. */
export function parseProductSearchParams(sp: RawSearchParams): ProductQuery {
  const sortRaw = first(sp.sort) as ProductSort | undefined;
  return {
    categories: list(sp.category),
    brands: list(sp.brand),
    fuelTypes: list(sp.fuel),
    minKva: num(sp.minKva),
    maxKva: num(sp.maxKva),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    q: first(sp.q),
    sort: sortRaw && SORTS.includes(sortRaw) ? sortRaw : undefined,
    page: num(sp.page),
  };
}
