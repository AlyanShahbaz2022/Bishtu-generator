import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrderByNumber, type OrderDetail } from "@/services/orders";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Order confirmation" };

type Params = { orderNumber: string };

type Notes = {
  contact?: { fullName?: string; email?: string; phone?: string };
  address?: {
    address?: string;
    city?: string;
    province?: string | null;
    postalCode?: string | null;
  };
};

function parseNotes(notes: string | null): Notes {
  if (!notes) return {};
  try {
    return JSON.parse(notes) as Notes;
  } catch {
    return {};
  }
}

export default async function OrderPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const notes = parseNotes(order.notes);
  const isBankTransfer = order.paymentMethod === "BANK_TRANSFER";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
          Thank you for your order
        </h1>
        <p className="mt-2 text-muted-foreground">
          Order{" "}
          <span className="font-semibold text-foreground">
            {order.orderNumber}
          </span>{" "}
          has been received. A confirmation email is on its way.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Badge variant="secondary">Status: {titleCase(order.status)}</Badge>
        <Badge variant="outline">
          Payment: {titleCase(order.paymentStatus)}
        </Badge>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <h2 className="mb-4 font-heading font-semibold">Items</h2>
          <ul className="space-y-3 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <Link
                  href={`/product/${item.product.slug}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  {item.product.name} × {item.quantity}
                </Link>
                <span className="font-medium whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">
              {formatPrice(order.total)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6 text-sm">
            <h2 className="mb-3 font-heading font-semibold">Shipping to</h2>
            {notes.contact?.fullName && <p>{notes.contact.fullName}</p>}
            {notes.address?.address && (
              <p className="text-muted-foreground">{notes.address.address}</p>
            )}
            <p className="text-muted-foreground">
              {[
                notes.address?.city,
                notes.address?.province,
                notes.address?.postalCode,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            {notes.contact?.phone && (
              <p className="mt-1 text-muted-foreground">
                {notes.contact.phone}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-sm">
            <h2 className="mb-3 font-heading font-semibold">Payment</h2>
            {isBankTransfer ? (
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Please transfer {formatPrice(order.total)} to:
                </p>
                <p>Bank: Tech &amp; Tune (HBL)</p>
                <p>Account #: 1234-5678-9012-3456</p>
                <p>IBAN: PK00 HABB 0000 1234 5678 9012</p>
                <p className="mt-2 text-muted-foreground">
                  Use <strong>{order.orderNumber}</strong> as the payment
                  reference. We&apos;ll confirm once received.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Cash on Delivery — pay {formatPrice(order.total)} when your
                order is delivered or installed.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/products">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/orders">View my orders</Link>
        </Button>
      </div>
    </div>
  );
}

function titleCase(value: OrderDetail["status"] | string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}
