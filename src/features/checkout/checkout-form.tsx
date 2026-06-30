"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeOrder } from "@/features/checkout/actions";
import { useCart } from "@/features/cart/use-cart";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, count, clear } = useCart();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  if (count === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="font-medium">Your cart is empty</p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    const res = await placeOrder({
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      city: String(form.get("city") ?? ""),
      province: String(form.get("province") ?? ""),
      postalCode: String(form.get("postalCode") ?? ""),
      address: String(form.get("address") ?? ""),
      paymentMethod:
        form.get("paymentMethod") === "CASH" ? "CASH" : "BANK_TRANSFER",
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    clear();
    toast.success("Order placed!");
    router.push(`/order/${res.orderNumber}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_340px]"
    >
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 font-heading font-semibold">Contact details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="fullName"
              label="Full name"
              defaultValue={session?.user?.name}
              required
            />
            <Field
              name="email"
              label="Email"
              type="email"
              defaultValue={session?.user?.email}
              required
            />
            <Field name="phone" label="Phone" type="tel" required />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-heading font-semibold">Shipping address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field name="address" label="Address" required />
            </div>
            <Field name="city" label="City" required />
            <Field name="province" label="Province / State" />
            <Field name="postalCode" label="Postal code" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-heading font-semibold">Payment method</h2>
          <div className="space-y-3">
            <PaymentOption
              value="BANK_TRANSFER"
              defaultChecked
              title="Bank Transfer"
              description="We'll email our bank details. Your order is confirmed once payment is verified."
            />
            <PaymentOption
              value="CASH"
              title="Cash on Delivery"
              description="Pay in cash when your order is delivered or installed."
            />
          </div>
        </section>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardContent className="pt-6">
          <h2 className="font-heading font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="line-clamp-1 text-muted-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span className="font-medium whitespace-nowrap">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={loading}
          >
            {loading ? "Placing order…" : "Place order"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
      />
    </div>
  );
}

function PaymentOption({
  value,
  title,
  description,
  defaultChecked,
}: {
  value: string;
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-border p-4 has-checked:border-primary has-checked:bg-primary/5">
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        defaultChecked={defaultChecked}
        className="mt-1 size-4 accent-primary"
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}
