import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RentalForm } from "@/features/leads/components/rental-form";

export const metadata: Metadata = {
  title: "Generator Rentals",
  description:
    "Short and long-term generator rentals with delivery, installation, and transport across Pakistan.",
};

export default function RentalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Rentals" }]} />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        Request a generator rental
      </h1>
      <p className="mt-2 text-muted-foreground">
        Flexible short and long-term rentals with delivery, installation, and
        transport. Share your needs and we&apos;ll send a rental quotation.
      </p>
      <div className="mt-8">
        <RentalForm />
      </div>
    </div>
  );
}
