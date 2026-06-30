import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CatalogView } from "@/features/products/components/catalog-view";
import {
  parseProductSearchParams,
  type RawSearchParams,
} from "@/features/products/params";
import {
  getBrandBySlug,
  getFilterOptions,
  getProducts,
} from "@/services/products";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Brand not found" };
  return {
    title: brand.name,
    description:
      brand.description ?? `Browse ${brand.name} generators at Tech & Tune.`,
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const query = {
    ...parseProductSearchParams(sp),
    brands: [slug],
  };
  const [result, options] = await Promise.all([
    getProducts(query),
    getFilterOptions(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Breadcrumbs
        items={[
          { title: "Products", href: "/products" },
          { title: brand.name },
        ]}
      />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        {brand.name}
      </h1>
      {brand.country && (
        <p className="mt-2 text-muted-foreground">Origin: {brand.country}</p>
      )}

      <div className="mt-8">
        <CatalogView result={result} options={options} hideBrands />
      </div>
    </div>
  );
}
