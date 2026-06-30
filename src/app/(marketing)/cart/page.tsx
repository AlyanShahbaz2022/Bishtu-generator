import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CartView } from "@/features/cart/cart-view";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <Breadcrumbs items={[{ title: "Cart" }]} />
      <h1 className="mt-4 mb-8 font-heading text-3xl font-extrabold tracking-tight">
        Your cart
      </h1>
      <CartView />
    </div>
  );
}
