import { ImageResponse } from "next/og";

import { OgTemplate, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getBlogPostBySlug } from "@/services/content";

export const alt = "Article";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  return new ImageResponse(
    <OgTemplate
      eyebrow={post?.category?.name ?? "Blog"}
      title={post?.title ?? "Tech & Tune Blog"}
      subtitle={post?.excerpt ?? undefined}
    />,
    size,
  );
}
