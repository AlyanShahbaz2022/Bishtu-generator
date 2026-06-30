import type { Metadata } from "next";

import { DataTable, type Column } from "@/features/admin/components/data-table";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatusSelect } from "@/features/admin/components/status-select";
import {
  QUOTE_STATUSES,
  RENTAL_STATUSES,
  SERVICE_STATUSES,
} from "@/features/admin/inquiries/constants";
import {
  updateQuoteStatus,
  updateRentalStatus,
  updateServiceStatus,
} from "@/features/admin/inquiries/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Inquiries" };

export default async function InquiriesPage() {
  await requireAdmin();
  const [quotes, rentals, services] = await Promise.all([
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.rental.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  type Q = (typeof quotes)[number];
  const quoteCols: Column<Q>[] = [
    {
      header: "Name",
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      header: "Contact",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.email}
          <br />
          {r.phone}
        </span>
      ),
    },
    { header: "KVA", cell: (r) => r.requiredKVA ?? "—" },
    { header: "Type", cell: (r) => r.purchaseType },
    {
      header: "Status",
      cell: (r) => (
        <StatusSelect
          value={r.status}
          options={QUOTE_STATUSES}
          action={updateQuoteStatus.bind(null, r.id)}
        />
      ),
    },
    { header: "Date", cell: (r) => r.createdAt.toLocaleDateString() },
  ];

  type R = (typeof rentals)[number];
  const rentalCols: Column<R>[] = [
    {
      header: "Name",
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      header: "Contact",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.email}
          <br />
          {r.phone}
        </span>
      ),
    },
    { header: "Location", cell: (r) => r.location },
    {
      header: "Status",
      cell: (r) => (
        <StatusSelect
          value={r.status}
          options={RENTAL_STATUSES}
          action={updateRentalStatus.bind(null, r.id)}
        />
      ),
    },
    { header: "Date", cell: (r) => r.createdAt.toLocaleDateString() },
  ];

  type S = (typeof services)[number];
  const serviceCols: Column<S>[] = [
    {
      header: "Name",
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      header: "Contact",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.email}
          <br />
          {r.phone}
        </span>
      ),
    },
    { header: "Priority", cell: (r) => r.priority },
    {
      header: "Problem",
      cell: (r) => <span className="line-clamp-1 max-w-xs">{r.problem}</span>,
    },
    {
      header: "Status",
      cell: (r) => (
        <StatusSelect
          value={r.status}
          options={SERVICE_STATUSES}
          action={updateServiceStatus.bind(null, r.id)}
        />
      ),
    },
    { header: "Date", cell: (r) => r.createdAt.toLocaleDateString() },
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Inquiries"
        description="Quote, rental, and service requests."
      />

      <section>
        <h2 className="mb-3 font-heading font-semibold">
          Quote requests ({quotes.length})
        </h2>
        <DataTable
          columns={quoteCols}
          rows={quotes}
          getKey={(r) => r.id}
          empty="No quote requests."
        />
      </section>

      <section>
        <h2 className="mb-3 font-heading font-semibold">
          Rental requests ({rentals.length})
        </h2>
        <DataTable
          columns={rentalCols}
          rows={rentals}
          getKey={(r) => r.id}
          empty="No rental requests."
        />
      </section>

      <section>
        <h2 className="mb-3 font-heading font-semibold">
          Service requests ({services.length})
        </h2>
        <DataTable
          columns={serviceCols}
          rows={services}
          getKey={(r) => r.id}
          empty="No service requests."
        />
      </section>
    </div>
  );
}
