"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const orderStatus = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();
  const value = orderStatus.parse(status);
  await prisma.order.update({ where: { id }, data: { status: value } });
  revalidatePath("/admin/orders");
}

const paymentStatus = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]);

export async function updatePaymentStatus(id: string, status: string) {
  await requireAdmin();
  const value = paymentStatus.parse(status);
  await prisma.order.update({ where: { id }, data: { paymentStatus: value } });
  await prisma.payment.updateMany({
    where: { orderId: id },
    data: { status: value, paidAt: value === "PAID" ? new Date() : null },
  });
  revalidatePath("/admin/orders");
}
