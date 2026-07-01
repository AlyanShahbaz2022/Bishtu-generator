"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NAV_TAG } from "@/services/navigation";

function revalidate() {
  // Next 16: second arg required; "max" = stale-while-revalidate on next visit.
  revalidateTag(NAV_TAG, "max");
  revalidatePath("/admin/navigation");
}

export type NavResult = { ok: true } | { ok: false; error: string };

// A nav item is EITHER a category link (pick an existing category → auto-routed
// to /category/{slug}) OR a custom link (any label + any href). Categories are
// managed independently on /admin/categories; the nav manager never creates
// them.
const addSchema = z
  .object({
    label: z.string().min(1, "Label is required").max(80),
    level: z.number().int().min(0).max(2),
    parentId: z.string().optional(),
    categoryId: z.string().optional(),
    href: z.string().max(300).optional().or(z.literal("")),
  })
  .refine((v) => v.categoryId || v.label.trim(), {
    message: "Pick a category or enter a label",
  });

export async function addNavItem(
  input: z.input<typeof addSchema>,
): Promise<NavResult> {
  await requireAdmin();
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const { label, level, parentId, categoryId, href } = parsed.data;

  const max = await prisma.navItem.aggregate({
    where: { parentId: parentId ?? null, level },
    _max: { sortOrder: true },
  });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;

  // Category link: auto-route to the category's own /category/{slug} page.
  // Custom link: use the label + the href the admin typed (or none).
  let finalLabel = label.trim();
  let finalHref: string | null = href?.trim() || null;
  let finalCategoryId: string | null = null;

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true },
    });
    if (!category) return { ok: false, error: "Category not found." };
    finalCategoryId = category.id;
    finalHref = `/category/${category.slug}`;
    if (!finalLabel) finalLabel = category.name;
  }

  if (!finalLabel) return { ok: false, error: "Label is required." };

  await prisma.navItem.create({
    data: {
      label: finalLabel,
      level,
      parentId: parentId ?? null,
      categoryId: finalCategoryId,
      href: finalHref,
      sortOrder,
    },
  });
  revalidate();
  return { ok: true };
}

const editSchema = z.object({
  label: z.string().min(1, "Label is required").max(80),
  categoryId: z.string().optional(),
  href: z.string().max(300).optional().or(z.literal("")),
});

/**
 * Edit a nav item's label and target. Re-links to a category (auto-routed) when
 * `categoryId` is given, otherwise treats it as a custom link with the typed
 * href. Categories themselves are edited on /admin/categories.
 */
export async function updateNavItem(
  id: string,
  input: z.input<typeof editSchema>,
): Promise<NavResult> {
  await requireAdmin();
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const { label, categoryId, href } = parsed.data;

  let finalLabel = label.trim();
  let finalHref: string | null = href?.trim() || null;
  let finalCategoryId: string | null = null;

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true },
    });
    if (!category) return { ok: false, error: "Category not found." };
    finalCategoryId = category.id;
    finalHref = `/category/${category.slug}`;
    if (!finalLabel) finalLabel = category.name;
  }

  if (!finalLabel) return { ok: false, error: "Label is required." };

  await prisma.navItem.update({
    where: { id },
    data: { label: finalLabel, categoryId: finalCategoryId, href: finalHref },
  });
  revalidate();
  return { ok: true };
}

export async function toggleNavItem(id: string, isEnabled: boolean) {
  await requireAdmin();
  await prisma.navItem.update({ where: { id }, data: { isEnabled } });
  revalidate();
}

export async function deleteNavItem(id: string) {
  await requireAdmin();
  // Only the menu entry is removed; a linked category is left untouched (it is
  // managed on /admin/categories). Child items cascade via onDelete: Cascade.
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
