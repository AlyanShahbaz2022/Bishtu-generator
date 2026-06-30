import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/** Sort options exposed in the catalog UI. */
export type ProductSort =
  "newest" | "price-asc" | "price-desc" | "kva-asc" | "kva-desc" | "name";

export type ProductQuery = {
  categories?: string[];
  brands?: string[];
  fuelTypes?: string[];
  minKva?: number;
  maxKva?: number;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
  /** Only featured products. */
  featured?: boolean;
};

/** Serializable product shape for listing grids / cards. */
export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  kva: number | null;
  fuelType: string | null;
  generatorType: string | null;
  brandName: string | null;
  categoryName: string;
  image: string | null;
  stock: number;
  featured: boolean;
};

export type ProductListResult = {
  items: ProductListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

const DEFAULT_PER_PAGE = 9;

const ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  "kva-asc": { kva: "asc" },
  "kva-desc": { kva: "desc" },
  name: { name: "asc" },
};

function buildWhere(query: ProductQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    published: true,
    deletedAt: null,
    status: "ACTIVE",
  };

  if (query.categories?.length)
    where.category = { slug: { in: query.categories } };
  if (query.brands?.length) where.brand = { slug: { in: query.brands } };
  if (query.fuelTypes?.length)
    where.fuelType = {
      in: query.fuelTypes as Prisma.EnumFuelTypeNullableFilter["in"],
    };

  if (query.minKva != null || query.maxKva != null) {
    const kva: Prisma.IntNullableFilter = {};
    if (query.minKva != null) kva.gte = query.minKva;
    if (query.maxKva != null) kva.lte = query.maxKva;
    where.kva = kva;
  }

  if (query.minPrice != null || query.maxPrice != null) {
    const price: Prisma.DecimalFilter = {};
    if (query.minPrice != null) price.gte = query.minPrice;
    if (query.maxPrice != null) price.lte = query.maxPrice;
    where.price = price;
  }

  if (query.featured) where.featured = true;

  if (query.q?.trim()) {
    const q = query.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

function toListItem(p: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: Prisma.Decimal;
  salePrice: Prisma.Decimal | null;
  kva: number | null;
  fuelType: string | null;
  generatorType: string | null;
  stock: number;
  featured: boolean;
  brand: { name: string } | null;
  category: { name: string };
  images: { url: string }[];
}): ProductListItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: Number(p.price),
    salePrice: p.salePrice == null ? null : Number(p.salePrice),
    kva: p.kva,
    fuelType: p.fuelType,
    generatorType: p.generatorType,
    brandName: p.brand?.name ?? null,
    categoryName: p.category.name,
    image: p.images[0]?.url ?? null,
    stock: p.stock,
    featured: p.featured,
  };
}

const listSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  price: true,
  salePrice: true,
  kva: true,
  fuelType: true,
  generatorType: true,
  stock: true,
  featured: true,
  brand: { select: { name: true } },
  category: { select: { name: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
} satisfies Prisma.ProductSelect;

/** Paginated, filtered, sorted product listing. */
export async function getProducts(
  query: ProductQuery = {},
): Promise<ProductListResult> {
  const where = buildWhere(query);
  const page = Math.max(1, query.page ?? 1);
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;
  const sort = query.sort ?? "newest";

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: ORDER_BY[sort],
      skip: (page - 1) * perPage,
      take: perPage,
      select: listSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: rows.map(toListItem),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Featured products for the homepage / merchandising rows. */
export async function getFeaturedProducts(
  limit = 4,
): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: {
      published: true,
      deletedAt: null,
      status: "ACTIVE",
      featured: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: listSelect,
  });
  return rows.map(toListItem);
}

/** Full product detail by slug (null if not found / unpublished). */
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, published: true, deletedAt: null },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      specifications: true,
      inventory: true,
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { name: true } } },
      },
    },
  });
  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice == null ? null : Number(product.salePrice),
  };
}

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductBySlug>>
>;

/** Related products from the same category (excludes the given product). */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
): Promise<ProductListItem[]> {
  const rows = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      published: true,
      deletedAt: null,
      status: "ACTIVE",
    },
    take: limit,
    orderBy: { featured: "desc" },
    select: listSelect,
  });
  return rows.map(toListItem);
}

/** Options for building the filter sidebar. */
export async function getFilterOptions() {
  const [categories, brands, fuelGroups, priceAgg, kvaAgg] = await Promise.all([
    prisma.category.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.brand.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.product.groupBy({
      by: ["fuelType"],
      where: { published: true, deletedAt: null, fuelType: { not: null } },
    }),
    prisma.product.aggregate({
      where: { published: true, deletedAt: null },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.product.aggregate({
      where: { published: true, deletedAt: null, kva: { not: null } },
      _min: { kva: true },
      _max: { kva: true },
    }),
  ]);

  return {
    categories,
    brands,
    fuelTypes: fuelGroups
      .map((g) => g.fuelType)
      .filter((f): f is NonNullable<typeof f> => f != null),
    priceMin: priceAgg._min.price ? Number(priceAgg._min.price) : 0,
    priceMax: priceAgg._max.price ? Number(priceAgg._max.price) : 0,
    kvaMin: kvaAgg._min.kva ?? 0,
    kvaMax: kvaAgg._max.kva ?? 0,
  };
}

/** Products (with key attributes) for the side-by-side comparison table. */
export async function getProductsForCompare(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { slug: { in: slugs }, published: true, deletedAt: null },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  // Preserve the order the user selected them in.
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      image: r.images[0]?.url ?? null,
      price: Number(r.price),
      salePrice: r.salePrice == null ? null : Number(r.salePrice),
      brandName: r.brand?.name ?? null,
      categoryName: r.category.name,
      stock: r.stock,
      attributes: {
        kva: r.kva,
        fuelType: r.fuelType,
        generatorType: r.generatorType,
        engineModel: r.engineModel,
        alternator: r.alternator,
        voltage: r.voltage,
        frequency: r.frequency,
        phase: r.phase,
        warranty: r.warranty,
      },
    }));
}

export type CompareProduct = Awaited<
  ReturnType<typeof getProductsForCompare>
>[number];

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, status: "ACTIVE", deletedAt: null },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findFirst({
    where: { slug, status: "ACTIVE", deletedAt: null },
  });
}
