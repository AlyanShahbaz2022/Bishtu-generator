"use client";

import { useSyncExternalStore } from "react";

const KEY = "tt-cart";
const EVENT = "tt-cart-change";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  /** Effective unit price (sale price if on sale). */
  price: number;
  quantity: number;
  stock: number;
};

const EMPTY: CartItem[] = [];
let cache: { raw: string; value: CartItem[] } | null = null;

function read(): CartItem[] {
  const raw = localStorage.getItem(KEY) ?? "[]";
  if (!cache || cache.raw !== raw) {
    let value: CartItem[] = [];
    try {
      value = JSON.parse(raw) as CartItem[];
    } catch {
      value = [];
    }
    cache = { raw, value };
  }
  return cache.value;
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function clamp(qty: number, stock: number) {
  const max = stock > 0 ? stock : qty;
  return Math.max(1, Math.min(qty, max));
}

/** Client hook for the localStorage-backed shopping cart. */
export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    count,
    subtotal,
    add(item: Omit<CartItem, "quantity">, quantity = 1) {
      const current = read();
      const existing = current.find((i) => i.productId === item.productId);
      let next: CartItem[];
      if (existing) {
        next = current.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: clamp(i.quantity + quantity, item.stock) }
            : i,
        );
      } else {
        next = [...current, { ...item, quantity: clamp(quantity, item.stock) }];
      }
      write(next);
    },
    setQuantity(productId: string, quantity: number) {
      write(
        read().map((i) =>
          i.productId === productId
            ? { ...i, quantity: clamp(quantity, i.stock) }
            : i,
        ),
      );
    },
    remove(productId: string) {
      write(read().filter((i) => i.productId !== productId));
    },
    clear() {
      write([]);
    },
  };
}
