import type { Metadata } from "next";

import { PageHeader } from "@/features/admin/components/page-header";
import { ProductForm } from "@/features/admin/products/product-form";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New product"
        description="Add a generator or part to the catalog."
      />
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
