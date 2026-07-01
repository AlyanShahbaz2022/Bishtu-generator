import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CatalogView } from "@/features/products/components/catalog-view";
import { RecentlyViewed } from "@/features/products/components/recently-viewed";
import {
  parseProductSearchParams,
  type RawSearchParams,
} from "@/features/products/params";
import { getFilterOptions, getProducts } from "@/services/products";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Products",
  description:
    "Browse diesel, petrol, silent, and open-type generators, accessories, and genuine spare parts.",
  path: "/products",
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const query = parseProductSearchParams(sp);
  const [result, options] = await Promise.all([
    getProducts(query),
    getFilterOptions(),
  ]);

  const heading = query.q ? `Search results for “${query.q}”` : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Breadcrumbs items={[{ title: "Products" }]} />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        {heading}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Genuine, warrantied power solutions backed by nationwide sales, service,
        and spare-parts support.
      </p>

      <div className="mt-8">
        <CatalogView result={result} options={options} />
      </div>

      <RecentlyViewed />
    </div>
  );
}
