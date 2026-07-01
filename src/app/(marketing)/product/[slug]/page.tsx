import { Check, Star, Truck, X } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { ProductCta } from "@/features/products/components/product-cta";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { ProductGrid } from "@/features/products/components/product-grid";
import { RecentlyViewed } from "@/features/products/components/recently-viewed";
import {
  getProductBySlug,
  getRelatedProducts,
  type ProductDetail,
  type ProductListItem,
} from "@/services/products";
import { formatPrice } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, productSchema } from "@/lib/structured-data";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return buildMetadata({
    title: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    path: `/product/${product.slug}`,
    images: product.images[0]
      ? [{ url: product.images[0].url, alt: product.name }]
      : undefined,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  const onSale = product.salePrice != null && product.salePrice < product.price;
  const inStock = product.stock > 0;
  const currentItem = toListItem(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <JsonLd
        data={productSchema({
          name: product.name,
          slug: product.slug,
          description: product.shortDescription ?? product.description,
          image: product.images[0]?.url,
          brand: product.brand?.name,
          sku: product.sku,
          price: onSale ? product.salePrice! : product.price,
          inStock,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          {
            name: product.category.name,
            path: `/category/${product.category.slug}`,
          },
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { title: "Products", href: "/products" },
          {
            title: product.category.name,
            href: `/category/${product.category.slug}`,
          },
          { title: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.brand && (
            <p className="text-sm text-muted-foreground">
              {product.brand.name}
            </p>
          )}
          <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {product.kva != null && (
              <Badge variant="secondary">{product.kva} KVA</Badge>
            )}
            {product.fuelType && (
              <Badge variant="outline">{titleCase(product.fuelType)}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(onSale ? product.salePrice! : product.price)}
            </span>
            {onSale && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <p
            className={
              inStock
                ? "mt-2 flex items-center gap-1.5 text-sm font-medium text-success"
                : "mt-2 flex items-center gap-1.5 text-sm font-medium text-destructive"
            }
          >
            {inStock ? <Check className="size-4" /> : <X className="size-4" />}
            {inStock ? `In stock (${product.stock} available)` : "Out of stock"}
          </p>

          {product.shortDescription && (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          <ProductCta
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.images[0]?.url ?? null,
              price: onSale ? product.salePrice! : product.price,
              stock: product.stock,
            }}
            className="mt-6"
            size="lg"
          />

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="size-4" />
            Nationwide delivery &amp; on-site installation available.
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <Section title="Description">
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </Section>
      )}

      {/* Specifications */}
      {product.specifications.length > 0 && (
        <Section title="Specifications">
          <dl className="grid max-w-3xl grid-cols-1 gap-x-8 sm:grid-cols-2">
            {product.specifications.map((spec) => (
              <div
                key={spec.id}
                className="flex justify-between gap-4 border-b border-border py-3 text-sm"
              >
                <dt className="text-muted-foreground">{spec.title}</dt>
                <dd className="font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {/* Reviews */}
      <Section title="Customer Reviews">
        <Reviews reviews={product.reviews} />
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section title="Related products">
          <ProductGrid products={related} />
        </Section>
      )}

      <RecentlyViewed current={currentItem} />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-5 font-heading text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Reviews({ reviews }: { reviews: ProductDetail["reviews"] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  const average =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Stars value={Math.round(average)} />
        <span className="text-sm font-medium">{average.toFixed(1)} / 5</span>
        <span className="text-sm text-muted-foreground">
          ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
        </span>
      </div>
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{review.customer.name}</p>
            <Stars value={review.rating} />
          </div>
          {review.title && <p className="mt-1 font-medium">{review.title}</p>}
          {review.review && (
            <p className="mt-1 text-sm text-muted-foreground">
              {review.review}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={
            i < value
              ? "size-4 fill-accent text-accent"
              : "size-4 text-muted-foreground"
          }
        />
      ))}
    </div>
  );
}

function toListItem(product: ProductDetail): ProductListItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.price,
    salePrice: product.salePrice,
    kva: product.kva,
    fuelType: product.fuelType,
    generatorType: product.generatorType,
    brandName: product.brand?.name ?? null,
    categoryName: product.category.name,
    image: product.images[0]?.url ?? null,
    stock: product.stock,
    featured: product.featured,
  };
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
