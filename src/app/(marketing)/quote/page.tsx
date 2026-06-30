import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { QuoteForm } from "@/features/leads/components/quote-form";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Get a tailored quotation for diesel, petrol, silent, or open-type generators — purchase or rental.",
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Request a Quote" }]} />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        Request a quote
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tell us your power requirements and our team will prepare a tailored
        quotation — usually within one business day.
      </p>
      <div className="mt-8">
        <QuoteForm />
      </div>
    </div>
  );
}
