"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import type { ProductListItem } from "@/services/products";
import { formatPrice } from "@/lib/format";

const KEY = "tt-recently-viewed";
const EVENT = "tt-recently-viewed-change";
const MAX = 8;
const EMPTY: ProductListItem[] = [];

let cache: { raw: string; value: ProductListItem[] } | null = null;

function read(): ProductListItem[] {
  const raw = localStorage.getItem(KEY) ?? "[]";
  if (!cache || cache.raw !== raw) {
    let value: ProductListItem[] = [];
    try {
      value = JSON.parse(raw) as ProductListItem[];
    } catch {
      value = [];
    }
    cache = { raw, value };
  }
  return cache.value;
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function record(product: ProductListItem) {
  const existing = read().filter((p) => p.id !== product.id);
  const updated = [product, ...existing].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Renders the visitor's recently-viewed products (localStorage). When `current`
 * is provided, it's recorded on mount and excluded from the displayed list.
 */
export function RecentlyViewed({ current }: { current?: ProductListItem }) {
  useEffect(() => {
    if (current) record(current);
  }, [current]);

  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const visible = items.filter((p) => p.id !== current?.id);

  if (visible.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-heading text-xl font-bold">Recently viewed</h2>
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
        {visible.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="group w-44 shrink-0"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
              {p.image && (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="176px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium">{p.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(p.salePrice ?? p.price)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
