import {
  AlertTriangle,
  MessageSquare,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalProducts,
    totalOrders,
    revenue,
    pendingQuotes,
    pendingRentals,
    pendingServices,
    lowStock,
    recentOrders,
    recentQuotes,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.quote.count({ where: { status: "PENDING" } }),
    prisma.rental.count({ where: { status: "PENDING" } }),
    prisma.serviceRequest.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { deletedAt: null, stock: { lte: 5 } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const pendingInquiries = pendingQuotes + pendingRentals + pendingServices;

  const kpis = [
    {
      label: "Products",
      value: String(totalProducts),
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Orders",
      value: String(totalOrders),
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      label: "Revenue (paid)",
      value: formatPrice(Number(revenue._sum.total ?? 0)),
      icon: Wallet,
      href: "/admin/orders",
    },
    {
      label: "Pending inquiries",
      value: String(pendingInquiries),
      icon: MessageSquare,
      href: "/admin/inquiries",
    },
    {
      label: "Low stock (≤5)",
      value: String(lowStock),
      icon: AlertTriangle,
      href: "/admin/products?status=active",
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your store." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <k.icon className="size-5 text-primary" />
                <p className="mt-3 text-2xl font-bold">{k.value}</p>
                <p className="text-sm text-muted-foreground">{k.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading font-semibold">Recent orders</h2>
              <Link
                href="/admin/orders"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {recentOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between py-2"
                  >
                    <Link
                      href={`/admin/orders/${o.orderNumber}`}
                      className="font-medium hover:text-primary"
                    >
                      {o.orderNumber}
                    </Link>
                    <span className="text-muted-foreground">{o.status}</span>
                    <span className="font-medium">
                      {formatPrice(Number(o.total))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading font-semibold">Recent inquiries</h2>
              <Link
                href="/admin/inquiries"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            {recentQuotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inquiries yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {recentQuotes.map((q) => (
                  <li
                    key={q.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="font-medium">{q.name}</span>
                    <span className="text-muted-foreground">{q.status}</span>
                    <span className="text-muted-foreground">
                      {q.createdAt.toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
