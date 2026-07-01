import type { Metadata } from "next";

import { PageHeader } from "@/features/admin/components/page-header";
import { NavManager } from "@/features/admin/navigation/nav-manager";
import { requireAdmin } from "@/lib/admin";
import { getAdminNavTree } from "@/services/navigation";

export const metadata: Metadata = { title: "Navigation" };

export default async function NavigationPage() {
  await requireAdmin();
  const tree = await getAdminNavTree();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Navigation & Categories"
        description="Build the storefront menu — departments, categories, and sub-categories. Adding a category creates a matching storefront category; use the sliders icon to edit its fuel type, image, and description. Changes apply instantly."
      />
      <NavManager tree={tree} />
    </div>
  );
}
