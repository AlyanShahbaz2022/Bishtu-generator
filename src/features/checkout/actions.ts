"use server";

import { z } from "zod";

import { sendOrderConfirmationEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/format";
import { getServerSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Phone is required").max(20),
  city: z.string().min(2, "City is required").max(80),
  province: z.string().max(80).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  address: z.string().min(5, "Address is required").max(300),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(999),
      }),
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PlaceOrderResult =
  { ok: true; orderNumber: string } | { ok: false; error: string };

function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TT-${ymd}-${rand}`;
}

export async function placeOrder(
  input: CheckoutInput,
): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid order",
    };
  }
  const data = parsed.data;

  // Recompute everything from the DB — never trust client prices.
  const products = await prisma.product.findMany({
    where: {
      id: { in: data.items.map((i) => i.productId) },
      published: true,
      deletedAt: null,
    },
    select: { id: true, name: true, price: true, salePrice: true },
  });
  if (products.length === 0) {
    return { ok: false, error: "None of the cart items are available." };
  }

  const priceById = new Map(
    products.map((p) => [p.id, Number(p.salePrice ?? p.price)]),
  );

  const lineItems = data.items
    .filter((i) => priceById.has(i.productId))
    .map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: priceById.get(i.productId)!,
    }));

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal; // flat: no shipping/tax in MVP

  const session = await getServerSession();
  const orderNumber = generateOrderNumber();

  await prisma.order.create({
    data: {
      userId: session?.user?.id ?? null,
      orderNumber,
      status: "PENDING",
      subtotal,
      total,
      paymentStatus: "PENDING",
      paymentMethod: data.paymentMethod,
      notes: JSON.stringify({
        contact: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        },
        address: {
          address: data.address,
          city: data.city,
          province: data.province || null,
          postalCode: data.postalCode || null,
        },
      }),
      items: { create: lineItems },
      payment: {
        create: {
          provider: data.paymentMethod,
          amount: total,
          currency: "PKR",
          status: "PENDING",
        },
      },
    },
  });

  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  try {
    await sendOrderConfirmationEmail({
      to: data.email,
      name: data.fullName,
      orderNumber,
      total: formatPrice(total),
      paymentMethod:
        data.paymentMethod === "CASH" ? "Cash on Delivery" : "Bank Transfer",
      url: `${baseUrl}/order/${orderNumber}`,
    });
  } catch {
    // Don't fail the order if the email provider hiccups.
  }

  return { ok: true, orderNumber };
}
