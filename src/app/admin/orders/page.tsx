import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusSelect } from "@/features/admin/components/status-select";
import { updateOrderStatus } from "@/features/admin/orders/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Orders" };

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

type Row = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  paymentStatus: string;
  date: string;
};

function customerName(notes: string | null): string {
  if (!notes) return "Guest";
  try {
    return (
      (JSON.parse(notes) as { contact?: { fullName?: string } }).contact
        ?.fullName ?? "Guest"
    );
  } catch {
    return "Guest";
  }
}

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const rows: Row[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: customerName(o.notes),
    total: Number(o.total),
    status: o.status,
    paymentStatus: o.paymentStatus,
    date: o.createdAt.toLocaleDateString(),
  }));

  const columns: Column<Row>[] = [
    {
      header: "Order",
      cell: (r) => (
        <Link
          href={`/admin/orders/${r.orderNumber}`}
          className="font-medium hover:text-primary"
        >
          {r.orderNumber}
        </Link>
      ),
    },
    { header: "Customer", cell: (r) => r.customer },
    { header: "Total", cell: (r) => formatPrice(r.total) },
    {
      header: "Payment",
      cell: (r) => (
        <Badge variant={r.paymentStatus === "PAID" ? "default" : "secondary"}>
          {r.paymentStatus}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (r) => (
        <StatusSelect
          value={r.status}
          options={ORDER_STATUSES}
          action={updateOrderStatus.bind(null, r.id)}
        />
      ),
    },
    { header: "Date", cell: (r) => r.date },
    {
      header: "",
      className: "text-right",
      cell: (r) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/orders/${r.orderNumber}`}>View</Link>
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Orders" description={`${rows.length} recent orders`} />
      <DataTable
        columns={columns}
        rows={rows}
        getKey={(r) => r.id}
        empty="No orders yet."
      />
    </div>
  );
}
