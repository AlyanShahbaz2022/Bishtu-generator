import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { getProjectBySlug } from "@/services/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description ?? undefined,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
      <Breadcrumbs
        items={[
          { title: "Projects", href: "/projects" },
          { title: project.title },
        ]}
      />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        {project.title}
      </h1>

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm text-muted-foreground">
        {project.client && (
          <div>
            <dt className="inline font-medium">Client: </dt>
            <dd className="inline">{project.client}</dd>
          </div>
        )}
        {project.location && (
          <div>
            <dt className="inline font-medium">Location: </dt>
            <dd className="inline">{project.location}</dd>
          </div>
        )}
        {project.generatorBrand && (
          <div>
            <dt className="inline font-medium">Brand: </dt>
            <dd className="inline">{project.generatorBrand}</dd>
          </div>
        )}
        {project.generatorCapacity && (
          <div>
            <dt className="inline font-medium">Capacity: </dt>
            <dd className="inline">{project.generatorCapacity}</dd>
          </div>
        )}
      </dl>

      {project.images[0] && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 900px"
            className="object-cover"
          />
        </div>
      )}

      {project.description && (
        <p className="mt-6 leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/quote">Start a similar project</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/projects">All projects</Link>
        </Button>
      </div>
    </div>
  );
}
