import { Package } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerSession } from "@/lib/auth-session";
import { getUserOrders } from "@/services/orders";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?callbackUrl=/dashboard/orders");

  const orders = await getUserOrders(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        My orders
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track your orders and review past purchases.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Package className="size-10 text-muted-foreground" />
          <p className="mt-4 font-medium">No orders yet</p>
          <Button asChild className="mt-6">
            <Link href="/products">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Card className="p-0">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <Link
                      href={`/order/${order.orderNumber}`}
                      className="font-semibold hover:text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt.toLocaleDateString()} · {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{titleCase(order.status)}</Badge>
                    <span className="font-semibold">
                      {formatPrice(order.total)}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/order/${order.orderNumber}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}
