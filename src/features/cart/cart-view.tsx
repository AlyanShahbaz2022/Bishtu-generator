"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/features/cart/use-cart";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { items, subtotal, count, setQuantity, remove } = useCart();

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <ShoppingCart className="size-10 text-muted-foreground" />
        <p className="mt-4 font-medium">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse our generators and add items to your cart.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.productId}>
            <Card className="p-0">
              <CardContent className="flex gap-4 p-4">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </Link>

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/product/${item.slug}`}
                    className="line-clamp-2 font-medium hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatPrice(item.price)} each
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          setQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => remove(item.productId)}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="pt-6">
          <h2 className="font-heading font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Subtotal ({count} {count === 1 ? "item" : "items"})
              </dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="link" className="mt-2 w-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
