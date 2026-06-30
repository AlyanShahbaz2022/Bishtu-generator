import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/features/admin/components/page-header";
import { AdminProductFilters } from "@/features/admin/products/product-filters";
import {
  ProductsTable,
  type ProductRow,
} from "@/features/admin/products/products-table";
import { Pagination } from "@/features/products/components/pagination";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Products" };

const PER_PAGE = 20;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const where: Prisma.ProductWhereInput = { deletedAt: null };
  if (sp.q)
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { sku: { contains: sp.q, mode: "insensitive" } },
    ];
  if (sp.category) where.category = { slug: sp.category };
  if (sp.fuel) where.fuelType = sp.fuel as Prisma.ProductWhereInput["fuelType"];
  if (sp.status === "active") where.published = true;
  if (sp.status === "inactive") where.published = false;
  if (sp.featured === "1") where.featured = true;

  const page = Math.max(1, Number(sp.page) || 1);

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        category: { select: { name: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    image: p.images[0]?.url ?? null,
    categoryName: p.category.name,
    price: Number(p.price),
    stock: p.stock,
    published: p.published,
    featured: p.featured,
  }));

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${total} product${total === 1 ? "" : "s"}`}
        action={
          <Button asChild>
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        }
      />
      <AdminProductFilters categories={categories} />
      <ProductsTable rows={rows} />
      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PER_PAGE))}
      />
    </div>
  );
}
