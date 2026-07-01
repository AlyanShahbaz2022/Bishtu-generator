import type { Metadata } from "next";

import { PageHeader } from "@/features/admin/components/page-header";
import { NavManager } from "@/features/admin/navigation/nav-manager";
import { requireAdmin } from "@/lib/admin";
import { getAdminNavTree, getCategoryOptions } from "@/services/navigation";

export const metadata: Metadata = { title: "Navigation" };

export default async function NavigationPage() {
  await requireAdmin();
  const [tree, categories] = await Promise.all([
    getAdminNavTree(),
    getCategoryOptions(),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Navigation"
        description="Build the storefront navbar — departments, categories, and sub-categories. Each item can link to a product Category (auto-routed to its /category/<slug> page) or to any custom URL. Manage the categories themselves under Categories. Changes apply instantly."
      />
      <NavManager tree={tree} categories={categories} />
    </div>
  );
}
