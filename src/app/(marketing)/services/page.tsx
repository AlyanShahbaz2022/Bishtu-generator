import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { services } from "@/constants/marketing";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Generator sales, rentals, repair & maintenance, overhauling, spare parts, and power consultation.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Services" }]} />
      <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight">
        Our services
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        End-to-end power solutions — from supply and installation to lifetime
        maintenance and genuine parts.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, title, description, href }) => (
          <Card key={title} className="flex h-full flex-col">
            <CardContent className="flex flex-1 flex-col pt-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-4 font-heading text-lg font-semibold">
                {title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <Button asChild variant="link" className="mt-3 self-start px-0">
                <Link href={href}>
                  Learn more
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
