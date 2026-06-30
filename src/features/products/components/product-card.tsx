import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CompareToggle } from "@/features/products/components/compare-toggle";
import { QuickView } from "@/features/products/components/quick-view";
import type { ProductListItem } from "@/services/products";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: ProductListItem }) {
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const displayPrice = onSale ? product.salePrice! : product.price;

  return (
    <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="size-full bg-muted" />
          )}
        </Link>

        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && <Badge>Featured</Badge>}
          {onSale && <Badge variant="destructive">Sale</Badge>}
        </div>

        <QuickView product={product} />
        <CompareToggle slug={product.slug} name={product.name} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted-foreground">
          {product.brandName ?? product.categoryName}
        </p>
        <h3 className="mt-1 line-clamp-2 font-medium">
          <Link
            href={`/product/${product.slug}`}
            className="hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.kva != null && (
            <Badge variant="secondary" className="font-normal">
              {product.kva} KVA
            </Badge>
          )}
          {product.fuelType && (
            <Badge variant="outline" className="font-normal">
              {product.fuelType.charAt(0) +
                product.fuelType.slice(1).toLowerCase()}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatPrice(displayPrice)}</span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs">
          {product.stock > 0 ? (
            <span className="text-success">In stock</span>
          ) : (
            <span className="text-destructive">Out of stock</span>
          )}
        </p>
      </div>
    </Card>
  );
}
