import "server-only";

import { prisma } from "@/lib/prisma";

/** Fetch a single order (with items + product names) by public order number. */
export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: { select: { name: true, slug: true } } } },
      payment: true,
    },
  });
  if (!order) return null;

  return {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    items: order.items.map((i) => ({ ...i, price: Number(i.price) })),
  };
}

export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderByNumber>>
>;

/** Orders belonging to a user, newest first (for the customer dashboard). */
export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    createdAt: order.createdAt,
  }));
}
