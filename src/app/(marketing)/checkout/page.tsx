import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CheckoutForm } from "@/features/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <Breadcrumbs
        items={[{ title: "Cart", href: "/cart" }, { title: "Checkout" }]}
      />
      <h1 className="mt-4 mb-8 font-heading text-3xl font-extrabold tracking-tight">
        Checkout
      </h1>
      <CheckoutForm />
    </div>
  );
}
