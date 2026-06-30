import type { Metadata } from "next";

import { ConfirmDelete } from "@/features/admin/components/confirm-delete";
import { DataTable, type Column } from "@/features/admin/components/data-table";
import { InlineToggle } from "@/features/admin/components/inline-toggle";
import { PageHeader } from "@/features/admin/components/page-header";
import {
  BannerForm,
  type BannerData,
} from "@/features/admin/homepage/banner-form";
import { deleteBanner, toggleBanner } from "@/features/admin/homepage/actions";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Homepage" };

type Row = BannerData & { isActive: boolean };

export default async function HomepageAdminPage() {
  await requireAdmin();
  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const rows: Row[] = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    image: b.image,
    ctaLabel: b.ctaLabel,
    ctaHref: b.ctaHref,
    sortOrder: b.sortOrder,
    isActive: b.isActive,
  }));

  const columns: Column<Row>[] = [
    {
      header: "Banner",
      cell: (r) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={r.image}
            alt=""
            className="h-10 w-16 rounded object-cover"
          />
          <span className="font-medium">{r.title ?? "Untitled"}</span>
        </div>
      ),
    },
    { header: "Order", cell: (r) => r.sortOrder },
    {
      header: "Active",
      cell: (r) => (
        <InlineToggle
          checked={r.isActive}
          action={(next) => toggleBanner(r.id, next)}
          label="Active"
        />
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <BannerForm banner={r} />
          <ConfirmDelete
            action={deleteBanner.bind(null, r.id)}
            title="Delete banner?"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Homepage banners"
        description="Hero / carousel slides shown on the storefront homepage."
        action={<BannerForm />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        getKey={(r) => r.id}
        empty="No banners yet."
      />
    </div>
  );
}
