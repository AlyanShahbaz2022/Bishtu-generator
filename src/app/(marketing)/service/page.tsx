import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServiceForm } from "@/features/leads/components/service-form";

export const metadata: Metadata = {
  title: "Book a Service",
  description:
    "Book generator repair, maintenance, or overhauling. Certified engineers, genuine parts, nationwide support.",
};

export default function ServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Book a Service" }]} />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        Book a service
      </h1>
      <p className="mt-2 text-muted-foreground">
        Repair, maintenance, or overhauling by certified engineers using genuine
        parts. Tell us about your generator and we&apos;ll schedule a visit.
      </p>
      <div className="mt-8">
        <ServiceForm />
      </div>
    </div>
  );
}
