import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServicesView } from "@/features/marketing/services-view";
import { getBrands } from "@/services/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Power consultation, generator sales, and rentals — end-to-end power solutions backed by certified engineers and trusted brands.",
  path: "/services",
});

// Reads brand logos from the DB.
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let brands: Awaited<ReturnType<typeof getBrands>> = [];
  try {
    brands = await getBrands();
  } catch {
    brands = [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Services" }]} />
      <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight">
        Our services
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        From expert consultation and load planning to generator sales and
        flexible rentals — we deliver end-to-end power solutions with over a
        decade of on-the-ground experience across Pakistan&apos;s toughest
        industries.
      </p>

      {/* Consultation / Selling / Rental tabs (deep-linked from the navbar). */}
      <Suspense fallback={<div className="mt-10 h-48" />}>
        <ServicesView />
      </Suspense>

      {/* Experience / trusted companies */}
      <section className="mt-20 border-t border-border pt-12">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Trusted by industry
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">
            Brands and businesses we work with
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            We supply, install, and maintain equipment from the world&apos;s
            leading generator manufacturers — trusted by manufacturers,
            hospitals, data centers, and construction firms nationwide.
          </p>
        </div>

        {brands.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                {brand.logo ? (
                  <div className="relative h-12 w-full">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      sizes="(max-width: 1024px) 40vw, 200px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="font-heading text-lg font-bold">
                    {brand.name}
                  </span>
                )}
                {brand.country && (
                  <span className="text-xs text-muted-foreground">
                    {brand.country}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Brand partners coming soon.
          </p>
        )}

        {/* Simple experience stats */}
        <div className="mt-16 grid gap-6 rounded-3xl bg-secondary/40 p-8 text-center sm:grid-cols-3">
          {[
            { value: "10+ yrs", label: "Industry experience" },
            { value: "500+", label: "Installations delivered" },
            { value: "24/7", label: "Service & support" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-3xl font-extrabold text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
