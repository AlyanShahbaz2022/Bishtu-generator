import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

export const NAV_TAG = "storefront-nav";

export type StorefrontNavLeaf = {
  id: string;
  label: string;
  href: string | null;
};
export type StorefrontNavCategory = StorefrontNavLeaf & {
  children: StorefrontNavLeaf[];
};
export type StorefrontNavDepartment = StorefrontNavLeaf & {
  children: StorefrontNavCategory[];
};

/**
 * Cached storefront navigation tree (enabled items only). Revalidated via the
 * `NAV_TAG` tag whenever an admin mutates the nav (see features/admin/navigation).
 */
export const getStorefrontNav = unstable_cache(
  async (): Promise<StorefrontNavDepartment[]> => {
    const items = await prisma.navItem.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        label: true,
        href: true,
        level: true,
        parentId: true,
      },
    });

    const childrenOf = (parentId: string | null, level: number) =>
      items.filter((i) => i.parentId === parentId && i.level === level);

    return childrenOf(null, 0).map((dept) => ({
      id: dept.id,
      label: dept.label,
      href: dept.href,
      children: childrenOf(dept.id, 1).map((cat) => ({
        id: cat.id,
        label: cat.label,
        href: cat.href,
        children: childrenOf(cat.id, 2).map((sub) => ({
          id: sub.id,
          label: sub.label,
          href: sub.href,
        })),
      })),
    }));
  },
  ["storefront-nav"],
  { tags: [NAV_TAG] },
);

/** Category metadata surfaced inline in the nav manager (level-1 items). */
export type AdminNavCategory = {
  fuelType: string | null;
  image: string | null;
  description: string | null;
  productCount: number;
};

export type AdminNavItem = {
  id: string;
  label: string;
  href: string | null;
  level: number;
  parentId: string | null;
  categoryId: string | null;
  isEnabled: boolean;
  sortOrder: number;
  category: AdminNavCategory | null;
  children: AdminNavItem[];
};

/** Full nav tree (including disabled items) for the admin manager. Not cached. */
export async function getAdminNavTree(): Promise<AdminNavItem[]> {
  const items = await prisma.navItem.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      category: {
        select: {
          fuelType: true,
          image: true,
          description: true,
          _count: { select: { products: true } },
        },
      },
    },
  });

  const build = (parentId: string | null, level: number): AdminNavItem[] =>
    items
      .filter((i) => i.parentId === parentId && i.level === level)
      .map((i) => ({
        id: i.id,
        label: i.label,
        href: i.href,
        level: i.level,
        parentId: i.parentId,
        categoryId: i.categoryId,
        isEnabled: i.isEnabled,
        sortOrder: i.sortOrder,
        category: i.category
          ? {
              fuelType: i.category.fuelType,
              image: i.category.image,
              description: i.category.description,
              productCount: i.category._count.products,
            }
          : null,
        children: build(i.id, level + 1),
      }));

  return build(null, 0);
}
