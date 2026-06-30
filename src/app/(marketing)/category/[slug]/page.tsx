import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CatalogView } from "@/features/products/components/catalog-view";
import {
  parseProductSearchParams,
  type RawSearchParams,
} from "@/features/products/params";
import {
  getCategoryBySlug,
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
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.seoTitle ?? category.name,
    description:
      category.seoDescription ??
      category.description ??
      `Browse ${category.name} at Tech & Tune.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const query = {
    ...parseProductSearchParams(sp),
    categories: [slug],
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
          { title: category.name },
        ]}
      />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {category.description}
        </p>
      )}

      <div className="mt-8">
        <CatalogView result={result} options={options} hideCategories />
      </div>
    </div>
  );
}
