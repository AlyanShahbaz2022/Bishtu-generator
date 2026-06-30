import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusSelect } from "@/features/admin/components/status-select";
import {
  updateOrderStatus,
  updatePaymentStatus,
} from "@/features/admin/orders/actions";
import { getOrderByNumber } from "@/services/orders";
import { requireAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/app/admin/orders/page";

export const metadata: Metadata = { title: "Order" };

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

type Notes = {
  contact?: { fullName?: string; email?: string; phone?: string };
  address?: {
    address?: string;
    city?: string;
    province?: string | null;
    postalCode?: string | null;
  };
};

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await requireAdmin();
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  let notes: Notes = {};
  try {
    notes = order.notes ? (JSON.parse(order.notes) as Notes) : {};
  } catch {
    notes = {};
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={order.createdAt.toLocaleString()}
      />

      <div className="mb-6 flex flex-wrap gap-6">
        <label className="text-sm">
          <span className="mr-2 text-muted-foreground">Order status</span>
          <StatusSelect
            value={order.status}
            options={ORDER_STATUSES}
            action={updateOrderStatus.bind(null, order.id)}
          />
        </label>
        <label className="text-sm">
          <span className="mr-2 text-muted-foreground">Payment status</span>
          <StatusSelect
            value={order.paymentStatus}
            options={PAYMENT_STATUSES}
            action={updatePaymentStatus.bind(null, order.id)}
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h2 className="mb-4 font-heading font-semibold">Items</h2>
            <ul className="space-y-3 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
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
            <p className="mt-2 text-sm text-muted-foreground">
              Payment method: {order.paymentMethod ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-sm">
            <h2 className="mb-3 font-heading font-semibold">Customer</h2>
            <p>{notes.contact?.fullName ?? "Guest"}</p>
            {notes.contact?.email && (
              <p className="text-muted-foreground">{notes.contact.email}</p>
            )}
            {notes.contact?.phone && (
              <p className="text-muted-foreground">{notes.contact.phone}</p>
            )}
            <h3 className="mt-4 mb-1 font-heading font-semibold">Shipping</h3>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
