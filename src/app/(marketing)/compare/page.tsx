import { GitCompare } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  getProductsForCompare,
  type CompareProduct,
} from "@/services/products";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Compare products" };

const ROWS: { label: string; value: (p: CompareProduct) => string }[] = [
  { label: "Price", value: (p) => formatPrice(p.salePrice ?? p.price) },
  { label: "Brand", value: (p) => p.brandName ?? "—" },
  { label: "Category", value: (p) => p.categoryName },
  {
    label: "Power",
    value: (p) => (p.attributes.kva != null ? `${p.attributes.kva} KVA` : "—"),
  },
  { label: "Fuel type", value: (p) => titleCase(p.attributes.fuelType) },
  { label: "Type", value: (p) => titleCase(p.attributes.generatorType) },
  { label: "Engine", value: (p) => p.attributes.engineModel ?? "—" },
  { label: "Voltage", value: (p) => p.attributes.voltage ?? "—" },
  { label: "Frequency", value: (p) => p.attributes.frequency ?? "—" },
  { label: "Phase", value: (p) => p.attributes.phase ?? "—" },
  { label: "Warranty", value: (p) => p.attributes.warranty ?? "—" },
  {
    label: "Availability",
    value: (p) => (p.stock > 0 ? "In stock" : "Out of stock"),
  },
];

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>;
}) {
  const { slugs } = await searchParams;
  const list =
    slugs
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const products = await getProductsForCompare(list);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Breadcrumbs items={[{ title: "Compare" }]} />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        Compare products
      </h1>

      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <GitCompare className="size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">Nothing to compare yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add products using the compare button on any product card.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-40" />
                {products.map((p) => (
                  <th key={p.id} className="min-w-52 p-3 text-left align-top">
                    <Link href={`/product/${p.slug}`} className="group block">
                      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="208px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <span className="line-clamp-2 text-sm font-semibold group-hover:text-primary">
                        {p.name}
                      </span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    {row.label}
                  </th>
                  {products.map((p) => (
                    <td key={p.id} className="p-3 text-sm">
                      {row.value(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function titleCase(value: string | null) {
  if (!value) return "—";
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}
