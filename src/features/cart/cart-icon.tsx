"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/use-cart";

export function CartIcon({ className }: { className?: string }) {
  const { count } = useCart();

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      aria-label={`Cart (${count} items)`}
      className={className}
    >
      <Link href="/cart" className="relative">
        <ShoppingCart className="size-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
