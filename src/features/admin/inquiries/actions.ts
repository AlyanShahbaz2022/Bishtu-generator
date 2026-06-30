"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  QUOTE_STATUSES,
  RENTAL_STATUSES,
  SERVICE_STATUSES,
} from "@/features/admin/inquiries/constants";

export async function updateQuoteStatus(id: string, status: string) {
  await requireAdmin();
  const value = z.enum(QUOTE_STATUSES as [string, ...string[]]).parse(status);
  await prisma.quote.update({
    where: { id },
    data: { status: value as never },
  });
  revalidatePath("/admin/inquiries");
}

export async function updateRentalStatus(id: string, status: string) {
  await requireAdmin();
  const value = z.enum(RENTAL_STATUSES as [string, ...string[]]).parse(status);
  await prisma.rental.update({
    where: { id },
    data: { status: value as never },
  });
  revalidatePath("/admin/inquiries");
}

export async function updateServiceStatus(id: string, status: string) {
  await requireAdmin();
  const value = z.enum(SERVICE_STATUSES as [string, ...string[]]).parse(status);
  await prisma.serviceRequest.update({
    where: { id },
    data: { status: value as never },
  });
  revalidatePath("/admin/inquiries");
}
