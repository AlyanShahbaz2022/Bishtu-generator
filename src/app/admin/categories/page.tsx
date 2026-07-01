import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/features/admin/components/confirm-delete";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { PageHeader } from "@/features/admin/components/page-header";
import { CategoryForm } from "@/features/admin/categories/category-form";
import { deleteCategory } from "@/features/admin/categories/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Categories" };

type Row = {
  id: string;
  name: string;
  slug: string;
  fuelType: string | null;
  image: string | null;
  description: string | null;
  sortOrder: number;
  productCount: number;
};

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const rows: Row[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    fuelType: c.fuelType,
    image: c.image,
    description: c.description,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
  }));

  const columns: Column<Row>[] = [
    {
      header: "Name",
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      header: "Slug",
      cell: (r) => <span className="text-muted-foreground">{r.slug}</span>,
    },
    { header: "Fuel", cell: (r) => r.fuelType ?? "—" },
    { header: "Order", cell: (r) => r.sortOrder },
    {
      header: "Products",
      cell: (r) => <Badge variant="secondary">{r.productCount}</Badge>,
    },
    {
      header: "",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <CategoryForm
            category={{
              id: r.id,
              name: r.name,
              slug: r.slug,
              fuelType: r.fuelType,
              image: r.image,
              description: r.description,
              sortOrder: r.sortOrder,
            }}
          />
          <ConfirmDelete
            action={deleteCategory.bind(null, r.id)}
            title={`Delete “${r.name}”?`}
            description={
              r.productCount > 0
                ? `This category has ${r.productCount} product(s); deletion will be blocked until they are moved.`
                : "This category has no products and can be safely deleted."
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize the catalog. Categories are also created automatically from the Navigation manager."
        action={<CategoryForm />}
      />
      <DataTable columns={columns} rows={rows} getKey={(r) => r.id} />
    </div>
  );
}
