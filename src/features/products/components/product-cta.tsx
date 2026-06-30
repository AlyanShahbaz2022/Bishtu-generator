"use client";

import { MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";
import { cn } from "@/lib/utils";

const waNumber = siteConfig.contact.whatsapp.replace(/\D/g, "");

/**
 * Conversion CTAs shared by the product card quick-view and detail page.
 * Add to Cart is intentionally a placeholder — cart & checkout ship in Phase 5;
 * Request Quote and WhatsApp are fully functional now.
 */
export function ProductCta({
  productName,
  className,
  size = "default",
}: {
  productName: string;
  className?: string;
  size?: "default" | "lg";
}) {
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi Tech & Tune, I'm interested in the ${productName}. Please share details.`,
  )}`;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        size={size}
        onClick={() =>
          toast.info(
            "Cart & checkout launch in the next phase. For now, request a quote or message us on WhatsApp.",
          )
        }
      >
        <ShoppingCart />
        Add to Cart
      </Button>
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
