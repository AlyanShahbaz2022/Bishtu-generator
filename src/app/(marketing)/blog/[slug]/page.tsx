import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, getRelatedPosts } from "@/services/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.coverImage
      ? { images: [{ url: post.coverImage }] }
      : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, 3);
  const paragraphs = post.content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Breadcrumbs
        items={[{ title: "Blog", href: "/blog" }, { title: post.title }]}
      />

      {post.category && (
        <Badge variant="secondary" className="mt-4">
          {post.category.name}
        </Badge>
      )}
      <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {post.author?.name ? `${post.author.name} · ` : ""}
        {post.publishedAt?.toLocaleDateString()}
      </p>

      {post.coverImage && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <article className="mt-8 space-y-4 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-muted-foreground">
            {p}
          </p>
        ))}
      </article>

      {related.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-4 font-heading text-xl font-bold">
            Related articles
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/blog/${r.slug}`}
                  className="font-medium hover:text-primary"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 rounded-2xl bg-secondary/40 p-8 text-center">
        <h2 className="font-heading text-xl font-bold">
          Need power solutions advice?
        </h2>
        <Button asChild className="mt-4">
          <Link href="/quote">Request a quote</Link>
        </Button>
      </div>
    </div>
  );
}
