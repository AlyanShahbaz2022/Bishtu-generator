"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { NAV_TAG } from "@/services/navigation";

function revalidate() {
  // Next 16: second arg required; "max" = stale-while-revalidate on next visit.
  revalidateTag(NAV_TAG, "max");
  revalidatePath("/admin/navigation");
}

const addSchema = z.object({
  label: z.string().min(1, "Label is required").max(80),
  level: z.number().int().min(0).max(2),
  parentId: z.string().optional(),
});

export async function addNavItem(input: z.infer<typeof addSchema>) {
  await requireAdmin();
  const { label, level, parentId } = addSchema.parse(input);

  const max = await prisma.navItem.aggregate({
    where: { parentId: parentId ?? null, level },
    _max: { sortOrder: true },
  });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;

  let categoryId: string | undefined;
  let href: string | undefined;

  // Auto-sync: a level-1 nav item maps to a storefront Category.
  if (level === 1) {
    const slug = slugify(label);
    const existing = await prisma.category.findUnique({ where: { slug } });
    const category =
      existing ??
      (await prisma.category.create({ data: { name: label, slug } }));
    categoryId = category.id;
    href = `/category/${slug}`;
  }

  await prisma.navItem.create({
    data: {
      label,
      level,
      parentId: parentId ?? null,
      categoryId,
      href,
      sortOrder,
    },
  });
  revalidate();
}

export async function renameNavItem(id: string, label: string) {
  await requireAdmin();
  const value = z.string().min(1).max(80).parse(label);
  await prisma.navItem.update({ where: { id }, data: { label: value } });
  revalidate();
}

export async function updateNavHref(id: string, href: string) {
  await requireAdmin();
  await prisma.navItem.update({
    where: { id },
    data: { href: href.trim() || null },
  });
  revalidate();
}

export async function toggleNavItem(id: string, isEnabled: boolean) {
  await requireAdmin();
  await prisma.navItem.update({ where: { id }, data: { isEnabled } });
  revalidate();
}

export async function deleteNavItem(id: string) {
  await requireAdmin();
  // Children cascade-delete via the self-relation onDelete: Cascade.
  await prisma.navItem.delete({ where: { id } });
  revalidate();
}

export async function moveNavItem(id: string, direction: "up" | "down") {
  await requireAdmin();
  const item = await prisma.navItem.findUnique({ where: { id } });
  if (!item) return;

  const siblings = await prisma.navItem.findMany({
    where: { parentId: item.parentId, level: item.level },
    orderBy: { sortOrder: "asc" },
  });
  const index = siblings.findIndex((s) => s.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapWith];
  await prisma.$transaction([
    prisma.navItem.update({
      where: { id: a.id },
      data: { sortOrder: b.sortOrder },
    }),
    prisma.navItem.update({
      where: { id: b.id },
      data: { sortOrder: a.sortOrder },
    }),
  ]);
  revalidate();
}
