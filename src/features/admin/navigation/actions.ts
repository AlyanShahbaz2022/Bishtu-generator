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

  // Auto-route: every nav item (department, category, sub-category) maps to a
  // storefront Category and gets a real /category/{slug} page. A pre-existing
  // category with the same slug is reused so we never create duplicates.
  const slug = slugify(label);
  const existing = await prisma.category.findUnique({ where: { slug } });
  const category =
    existing ?? (await prisma.category.create({ data: { name: label, slug } }));

  await prisma.navItem.create({
    data: {
      label,
      level,
      parentId: parentId ?? null,
      categoryId: category.id,
      href: `/category/${slug}`,
      sortOrder,
    },
  });
  revalidate();
}

export async function renameNavItem(id: string, label: string) {
  await requireAdmin();
  const value = z.string().min(1).max(80).parse(label);
  const current = await prisma.navItem.findUnique({ where: { id } });
  if (!current) return;

  // Regenerate the slug/URL from the new label so the route reflects the name —
  // unless another category already owns that slug, in which case keep the
  // existing URL to avoid a collision.
  let href = current.href;
  if (current.categoryId) {
    const newSlug = slugify(value);
    const clash = await prisma.category.findFirst({
      where: { slug: newSlug, NOT: { id: current.categoryId } },
      select: { id: true },
    });
    await prisma.category.update({
      where: { id: current.categoryId },
      data: clash ? { name: value } : { name: value, slug: newSlug },
    });
    if (!clash) href = `/category/${newSlug}`;
  }

  await prisma.navItem.update({
    where: { id },
    data: { label: value, href },
  });
  revalidate();
}

const categorySchema = z.object({
  fuelType: z.enum(["DIESEL", "PETROL", "GAS"]).optional(),
  image: z.string().url().optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export type NavCategoryResult = { ok: true } | { ok: false; error: string };

/**
 * Edit the storefront Category linked to a level-1 nav item (fuel type, image,
 * description) — the metadata that used to live on the standalone Categories
 * page. The nav label stays the source of truth for the category name.
 */
export async function updateNavCategory(
  navItemId: string,
  input: z.input<typeof categorySchema>,
): Promise<NavCategoryResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const navItem = await prisma.navItem.findUnique({
    where: { id: navItemId },
    select: { categoryId: true },
  });
  if (!navItem?.categoryId) {
    return { ok: false, error: "This item is not linked to a category." };
  }
  const d = parsed.data;
  await prisma.category.update({
    where: { id: navItem.categoryId },
    data: {
      fuelType: d.fuelType ?? null,
      image: d.image || null,
      description: d.description || null,
    },
  });
  revalidate();
  return { ok: true };
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
  const item = await prisma.navItem.findUnique({
    where: { id },
    select: { categoryId: true },
  });

  // Block deletion while a linked category still has products, mirroring the
  // old Categories delete-guard so inventory is never orphaned.
  if (item?.categoryId) {
    const productCount = await prisma.product.count({
      where: { categoryId: item.categoryId },
    });
    if (productCount > 0) {
      throw new Error(
        `This category has ${productCount} product(s). Move or delete them first.`,
      );
    }
  }

  // Children cascade-delete via the self-relation onDelete: Cascade.
  await prisma.navItem.delete({ where: { id } });

  // Remove the now-unused linked category (safe: no products remain).
  if (item?.categoryId) {
    await prisma.category
      .delete({ where: { id: item.categoryId } })
      .catch(() => {
        // Category may be referenced elsewhere; leave it if delete fails.
      });
  }
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
