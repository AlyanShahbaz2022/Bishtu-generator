"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

const schema = z.object({
  title: z.string().max(150).optional().or(z.literal("")),
  subtitle: z.string().max(400).optional().or(z.literal("")),
  image: z.string().url("Image URL is required"),
  ctaLabel: z.string().max(60).optional().or(z.literal("")),
  ctaHref: z.string().max(200).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

function clean(d: z.infer<typeof schema>) {
  return {
    title: d.title || null,
    subtitle: d.subtitle || null,
    image: d.image,
    ctaLabel: d.ctaLabel || null,
    ctaHref: d.ctaHref || null,
    sortOrder: d.sortOrder,
  };
}

export async function createBanner(
  input: z.input<typeof schema>,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  await prisma.banner.create({ data: clean(parsed.data) });
  revalidatePath("/admin/homepage");
  return { ok: true };
}

export async function updateBanner(
  id: string,
  input: z.input<typeof schema>,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  await prisma.banner.update({ where: { id }, data: clean(parsed.data) });
  revalidatePath("/admin/homepage");
  return { ok: true };
}

export async function toggleBanner(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.banner.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/homepage");
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/homepage");
}
