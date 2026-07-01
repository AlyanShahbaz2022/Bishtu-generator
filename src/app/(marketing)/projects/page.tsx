import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card } from "@/components/ui/card";
import { getProjects } from "@/services/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "Selected generator installations and rental deployments by Tech & Tune.",
  path: "/projects",
});

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Projects" }]} />
      <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight">
        Our projects
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        A selection of installations and deployments across industries.
      </p>

      {projects.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          No projects published yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`}>
              <Card className="group h-full overflow-hidden p-0 transition-shadow hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {p.images[0] && (
                    <Image
                      src={p.images[0]}
                      alt={p.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground">
                    {[p.location, p.generatorCapacity]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h2 className="mt-1 line-clamp-2 font-medium">{p.title}</h2>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
