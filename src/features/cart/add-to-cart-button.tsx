"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/features/cart/use-cart";

export function AddToCartButton({
  product,
  size = "default",
}: {
  product: Omit<CartItem, "quantity">;
  size?: "default" | "lg";
}) {
  const { add } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <Button
      size={size}
      disabled={outOfStock}
      onClick={() => {
        add(product);
        toast.success(`${product.name} added to cart`);
      }}
    >
      <ShoppingCart />
      {outOfStock ? "Out of stock" : "Add to Cart"}
    </Button>
  );
}
