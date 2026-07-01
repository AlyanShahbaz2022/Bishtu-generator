import type { Metadata } from "next";

import { siteConfig } from "@/constants/site";

/** Site origin without a trailing slash. */
export const SITE_URL = siteConfig.url.replace(/\/$/, "");

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Shared metadata builder so every page emits consistent canonical +
 * OpenGraph + Twitter tags (TRD §18). Pass a site-relative `path` to get a
 * canonical URL and matching `og:url`.
 */
export function buildMetadata(input: {
  title?: string;
  description?: string;
  path?: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const {
    title,
    description,
    path = "/",
    images,
    noindex,
    type,
    publishedTime,
  } = input;
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: type ?? "website",
      url,
      siteName: siteConfig.name,
      title: title ?? undefined,
      description: description ?? undefined,
      images: images?.map((img) => ({
        url: absoluteUrl(img.url),
        width: img.width,
        height: img.height,
        alt: img.alt ?? title,
      })),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? undefined,
      description: description ?? undefined,
      images: images?.map((img) => absoluteUrl(img.url)),
    },
  };
}
