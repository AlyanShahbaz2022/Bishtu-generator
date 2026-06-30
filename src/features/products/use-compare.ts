"use client";

import { useSyncExternalStore } from "react";

const KEY = "tt-compare";
const EVENT = "tt-compare-change";
export const MAX_COMPARE = 4;
const EMPTY: string[] = [];

let cache: { raw: string; value: string[] } | null = null;

function read(): string[] {
  const raw = localStorage.getItem(KEY) ?? "[]";
  if (!cache || cache.raw !== raw) {
    let value: string[] = [];
    try {
      value = JSON.parse(raw) as string[];
    } catch {
      value = [];
    }
    cache = { raw, value };
  }
  return cache.value;
}

function write(slugs: string[]) {
  localStorage.setItem(KEY, JSON.stringify(slugs));
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

/** Client hook for the localStorage-backed product comparison selection. */
export function useCompare() {
  const slugs = useSyncExternalStore(subscribe, read, () => EMPTY);

  return {
    slugs,
    count: slugs.length,
    has: (slug: string) => slugs.includes(slug),
    isFull: slugs.length >= MAX_COMPARE,
    toggle(slug: string) {
      const current = read();
      if (current.includes(slug)) {
        write(current.filter((s) => s !== slug));
      } else if (current.length < MAX_COMPARE) {
        write([...current, slug]);
      }
    },
    remove(slug: string) {
      write(read().filter((s) => s !== slug));
    },
    clear() {
      write([]);
    },
  };
}
