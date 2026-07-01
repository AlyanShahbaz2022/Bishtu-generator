import { ImageResponse } from "next/og";

import { OgTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getProductBySlug } from "@/services/products";

export const alt = "Product";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Reads the DB per request — keep dynamic so it isn't prerendered at build.
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return new ImageResponse(
    <OgTemplate
      eyebrow={product?.brand?.name ?? "Industrial Generator"}
      title={product?.name ?? "Premium Industrial Power Solutions"}
      subtitle={product?.kva != null ? `${product.kva} KVA` : undefined}
    />,
    size,
  );
}
