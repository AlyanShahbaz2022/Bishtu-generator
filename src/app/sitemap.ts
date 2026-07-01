import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";
import { prisma } from "@/lib/prisma";

// Reads the DB — must not be prerendered against the pooler at build time.
export const dynamic = "force-dynamic";

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/services", changeFrequency: "monthly", priority: 0.7 },
  { path: "/industries", changeFrequency: "monthly", priority: 0.6 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/quote", changeFrequency: "yearly", priority: 0.6 },
  { path: "/rental", changeFrequency: "yearly", priority: 0.6 },
  { path: "/service", changeFrequency: "yearly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: absoluteUrl(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    const [products, categories, brands, posts, projects] = await Promise.all([
      prisma.product.findMany({
        where: { published: true, deletedAt: null, status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.brand.findMany({
        where: { deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blog.findMany({
        where: { published: true, deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.project.findMany({
        where: { published: true, deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const dynamicEntries: MetadataRoute.Sitemap = [
      ...products.map((p) => ({
        url: absoluteUrl(`/product/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...categories.map((c) => ({
        url: absoluteUrl(`/category/${c.slug}`),
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...brands.map((b) => ({
        url: absoluteUrl(`/brand/${b.slug}`),
        lastModified: b.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      ...posts.map((p) => ({
        url: absoluteUrl(`/blog/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...projects.map((p) => ({
        url: absoluteUrl(`/projects/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];

    return [...staticEntries, ...dynamicEntries];
  } catch {
    // If the DB is unreachable at request time, still serve static routes.
    return staticEntries;
  }
}
