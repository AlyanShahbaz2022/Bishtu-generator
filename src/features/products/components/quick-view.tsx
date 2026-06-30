"use client";

import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductCta } from "@/features/products/components/product-cta";
import type { ProductListItem } from "@/services/products";
import { formatPrice } from "@/lib/format";

export function QuickView({ product }: { product: ProductListItem }) {
  const [open, setOpen] = useState(false);
  const onSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          aria-label={`Quick view ${product.name}`}
          className="absolute top-3 right-3 opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Eye className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            {[product.brandName, product.categoryName]
              .filter(Boolean)
              .join(" · ")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2">
              {product.kva != null && (
                <Badge variant="secondary">{product.kva} KVA</Badge>
              )}
              {product.fuelType && (
                <Badge variant="outline">{titleCase(product.fuelType)}</Badge>
              )}
              {product.stock > 0 ? (
                <Badge>In stock</Badge>
              ) : (
                <Badge variant="destructive">Out of stock</Badge>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatPrice(onSale ? product.salePrice! : product.price)}
              </span>
              {onSale && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <ProductCta
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: onSale ? product.salePrice! : product.price,
                stock: product.stock,
              }}
              className="mt-6"
            />

            <Button asChild variant="link" className="mt-3 self-start px-0">
              <Link href={`/product/${product.slug}`}>View full details →</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
