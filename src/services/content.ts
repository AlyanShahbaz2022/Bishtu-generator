import "server-only";

import { prisma } from "@/lib/prisma";

export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFeaturedCategories(limit = 6) {
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: limit,
    include: { _count: { select: { products: true } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c._count.products,
  }));
}

export async function getBrands() {
  return prisma.brand.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, logo: true, country: true },
  });
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getFAQs() {
  return prisma.fAQ.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProjects() {
  return prisma.project.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getFeaturedProjects(limit = 3) {
  return prisma.project.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, published: true, deletedAt: null },
  });
}

export async function getBlogPosts() {
  return prisma.blog.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blog.findFirst({
    where: { slug, published: true, deletedAt: null },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
  });
}

export async function getRelatedPosts(currentId: string, limit = 3) {
  return prisma.blog.findMany({
    where: { published: true, deletedAt: null, id: { not: currentId } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}
