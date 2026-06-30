"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import type { CartItem } from "@/features/cart/use-cart";
import { siteConfig } from "@/constants/site";
import { cn } from "@/lib/utils";

const waNumber = siteConfig.contact.whatsapp.replace(/\D/g, "");

/** Conversion CTAs shared by the product card quick-view and detail page. */
export function ProductCta({
  product,
  className,
  size = "default",
}: {
  product: Omit<CartItem, "quantity">;
  className?: string;
  size?: "default" | "lg";
}) {
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi Tech & Tune, I'm interested in the ${product.name}. Please share details.`,
  )}`;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <AddToCartButton product={product} size={size} />
      <Button asChild size={size} variant="secondary">
        <Link href="/quote">Request Quote</Link>
      </Button>
      <Button
        asChild
        size={size}
        variant="outline"
        aria-label="Chat on WhatsApp"
      >
        <a href={waHref} target="_blank" rel="noopener noreferrer">
          <MessageCircle />
          WhatsApp
        </a>
      </Button>
    </div>
  );
}
