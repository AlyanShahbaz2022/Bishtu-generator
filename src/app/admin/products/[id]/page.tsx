import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/features/admin/components/page-header";
import {
  ProductForm,
  type ProductFormData,
} from "@/features/admin/products/product-form";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
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
  if (!product) notFound();

  const data: ProductFormData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId,
    brandId: product.brandId,
    price: Number(product.price),
    salePrice: product.salePrice == null ? null : Number(product.salePrice),
    costPrice: product.costPrice == null ? null : Number(product.costPrice),
    stock: product.stock,
    minimumStock: product.minimumStock,
    kva: product.kva,
    fuelType: product.fuelType,
    generatorType: product.generatorType,
    engineModel: product.engineModel,
    alternator: product.alternator,
    voltage: product.voltage,
    frequency: product.frequency,
    phase: product.phase,
    warranty: product.warranty,
    datasheetUrl: product.datasheetUrl,
    shortDescription: product.shortDescription,
    description: product.description,
    featured: product.featured,
    published: product.published,
    images: product.images.map((i) => i.url),
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Edit product" description={product.name} />
      <ProductForm product={data} categories={categories} brands={brands} />
    </div>
  );
}
