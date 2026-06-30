import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getBlogPosts } from "@/services/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides and insights on generators, power solutions, and maintenance.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Blog" }]} />
      <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight">
        Blog
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Guides and insights on power solutions, generator sizing, and
        maintenance.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No articles published yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group h-full overflow-hidden p-0 transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {post.coverImage && (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  {post.category && (
                    <Badge variant="secondary">{post.category.name}</Badge>
                  )}
                  <h2 className="mt-2 line-clamp-2 font-heading font-semibold">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  {post.publishedAt && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {post.publishedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
