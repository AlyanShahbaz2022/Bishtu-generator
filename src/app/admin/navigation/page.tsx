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
        description="Build the storefront menu — departments, categories, and sub-categories. Every item you add gets its own storefront page at /category/<name> automatically and appears on the navbar. Use the sliders icon to edit a category's fuel type, image, and description. Changes apply instantly."
      />
      <NavManager tree={tree} />
    </div>
  );
}
