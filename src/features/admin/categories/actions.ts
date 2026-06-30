"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type ActionResult = { ok: true } | { ok: false; error: string };

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().max(120).optional().or(z.literal("")),
  fuelType: z.enum(["DIESEL", "PETROL", "GAS"]).optional(),
  image: z.string().url().optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export async function createCategory(
  input: z.input<typeof schema>,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);

  const clash = await prisma.category.findUnique({ where: { slug } });
  if (clash)
    return { ok: false, error: "A category with this slug already exists." };

  await prisma.category.create({
    data: {
      name: d.name,
      slug,
      fuelType: d.fuelType,
      image: d.image || null,
      description: d.description || null,
      sortOrder: d.sortOrder,
    },
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateCategory(
  id: string,
  input: z.input<typeof schema>,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);

  const clash = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (clash)
    return { ok: false, error: "A category with this slug already exists." };

  await prisma.category.update({
    where: { id },
    data: {
      name: d.name,
      slug,
      fuelType: d.fuelType ?? null,
      image: d.image || null,
      description: d.description || null,
      sortOrder: d.sortOrder,
    },
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(
      `Category has ${count} product(s). Move or delete them first.`,
    );
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
