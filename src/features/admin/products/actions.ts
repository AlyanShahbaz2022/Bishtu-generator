"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type ActionResult =
  { ok: true; id: string } | { ok: false; error: string };

const optStr = z.string().max(120).optional().or(z.literal(""));
const optNum = z.coerce.number().optional();

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: optStr,
  sku: z.string().min(1, "SKU is required").max(60),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional().or(z.literal("")),
  price: z.coerce.number().nonnegative("Price must be ≥ 0"),
  salePrice: optNum,
  costPrice: optNum,
  stock: z.coerce.number().int().min(0).default(0),
  minimumStock: z.coerce.number().int().min(0).default(0),
  kva: optNum,
  fuelType: z.enum(["DIESEL", "PETROL", "GAS"]).optional(),
  generatorType: z.enum(["DIESEL", "PETROL", "SILENT", "OPEN_TYPE"]).optional(),
  engineModel: optStr,
  alternator: optStr,
  voltage: optStr,
  frequency: optStr,
  phase: optStr,
  warranty: optStr,
  datasheetUrl: z.string().url().optional().or(z.literal("")),
  shortDescription: z.string().max(500).optional().or(z.literal("")),
  description: z.string().max(5000).optional().or(z.literal("")),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  images: z.array(z.string().url()).default([]),
});

export type ProductInput = z.input<typeof schema>;

function toData(d: z.infer<typeof schema>, slug: string) {
  return {
    name: d.name,
    slug,
    sku: d.sku,
    categoryId: d.categoryId,
    brandId: d.brandId || null,
    price: d.price,
    salePrice: d.salePrice ?? null,
    costPrice: d.costPrice ?? null,
    stock: d.stock,
    minimumStock: d.minimumStock,
    kva: d.kva ?? null,
    fuelType: d.fuelType ?? null,
    generatorType: d.generatorType ?? null,
    engineModel: d.engineModel || null,
    alternator: d.alternator || null,
    voltage: d.voltage || null,
    frequency: d.frequency || null,
    phase: d.phase || null,
    warranty: d.warranty || null,
    datasheetUrl: d.datasheetUrl || null,
    shortDescription: d.shortDescription || null,
    description: d.description || null,
    featured: d.featured,
    published: d.published,
  };
}

export async function createProduct(
  input: ProductInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);

  if (await prisma.product.findUnique({ where: { slug } }))
    return { ok: false, error: "A product with this slug already exists." };
  if (await prisma.product.findUnique({ where: { sku: d.sku } }))
    return { ok: false, error: "A product with this SKU already exists." };

  const product = await prisma.product.create({
    data: {
      ...toData(d, slug),
      images: {
        create: d.images.map((url, i) => ({ url, sortOrder: i })),
      },
    },
  });
  revalidatePath("/admin/products");
  return { ok: true, id: product.id };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);

  if (await prisma.product.findFirst({ where: { slug, NOT: { id } } }))
    return { ok: false, error: "A product with this slug already exists." };
  if (await prisma.product.findFirst({ where: { sku: d.sku, NOT: { id } } }))
    return { ok: false, error: "A product with this SKU already exists." };

  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: toData(d, slug) }),
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productImage.createMany({
      data: d.images.map((url, i) => ({ productId: id, url, sortOrder: i })),
    }),
  ]);
  revalidatePath("/admin/products");
  return { ok: true, id };
}

/** Soft-delete (preserves order history via OrderItem FK). */
export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), published: false },
  });
  revalidatePath("/admin/products");
}

export async function setProductFlag(
  id: string,
  field: "published" | "featured",
  value: boolean,
) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { [field]: value } });
  revalidatePath("/admin/products");
}

export type BulkAction =
  "activate" | "deactivate" | "feature" | "unfeature" | "delete";

export async function bulkProducts(ids: string[], action: BulkAction) {
  await requireAdmin();
  if (ids.length === 0) return;
  const where = { id: { in: ids } };
  switch (action) {
    case "activate":
      await prisma.product.updateMany({ where, data: { published: true } });
      break;
    case "deactivate":
      await prisma.product.updateMany({ where, data: { published: false } });
      break;
    case "feature":
      await prisma.product.updateMany({ where, data: { featured: true } });
      break;
    case "unfeature":
      await prisma.product.updateMany({ where, data: { featured: false } });
      break;
    case "delete":
      await prisma.product.updateMany({
        where,
        data: { deletedAt: new Date(), published: false },
      });
      break;
  }
  revalidatePath("/admin/products");
}
