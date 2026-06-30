"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDelete } from "@/features/admin/components/confirm-delete";
import { InlineToggle } from "@/features/admin/components/inline-toggle";
import {
  bulkProducts,
  deleteProduct,
  setProductFlag,
} from "@/features/admin/products/actions";
import { formatPrice } from "@/lib/format";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  categoryName: string;
  price: number;
  stock: number;
  published: boolean;
  featured: boolean;
};

const BULK: { value: Parameters<typeof bulkProducts>[1]; label: string }[] = [
  { value: "activate", label: "Activate" },
  { value: "deactivate", label: "Deactivate" },
  { value: "feature", label: "Feature" },
  { value: "unfeature", label: "Unfeature" },
  { value: "delete", label: "Delete" },
];

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const allChecked = rows.length > 0 && selected.size === rows.length;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }
  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  }
  function runBulk(action: Parameters<typeof bulkProducts>[1]) {
    start(async () => {
      try {
        await bulkProducts([...selected], action);
        toast.success("Updated");
        setSelected(new Set());
        router.refresh();
      } catch {
        toast.error("Bulk action failed");
      }
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No products match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-2 text-sm">
          <span className="px-1 font-medium">{selected.size} selected</span>
          {BULK.map((b) => (
            <Button
              key={b.value}
              size="sm"
              variant={b.value === "delete" ? "destructive" : "outline"}
              disabled={pending}
              onClick={() => runBulk(b.value)}
            >
              {b.label}
            </Button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="size-4 accent-primary"
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    className="size-4 accent-primary"
                    aria-label={`Select ${r.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.image && (
                      <img
                        src={r.image}
                        alt=""
                        className="size-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.sku}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.categoryName}
                </TableCell>
                <TableCell>{formatPrice(r.price)}</TableCell>
                <TableCell>{r.stock}</TableCell>
                <TableCell>
                  <InlineToggle
                    checked={r.published}
                    action={(next) => setProductFlag(r.id, "published", next)}
                    label="Active"
                  />
                </TableCell>
                <TableCell>
                  <InlineToggle
                    checked={r.featured}
                    action={(next) => setProductFlag(r.id, "featured", next)}
                    label="Featured"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/products/${r.id}`}>Edit</Link>
                    </Button>
                    <ConfirmDelete
                      action={deleteProduct.bind(null, r.id)}
                      title={`Delete “${r.name}”?`}
                      description="The product is hidden from the storefront but kept for order history."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
