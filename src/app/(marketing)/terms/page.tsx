import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Terms of Service" }]} />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        Terms of Service
      </h1>
      <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
        <p>
          By using this website you agree to these terms. Product
          specifications, pricing, and availability are subject to change
          without notice. Quotes are estimates until confirmed by our sales
          team.
        </p>
        <p>
          Orders placed online are confirmed once payment is verified. Warranty
          terms vary by manufacturer and product. For full terms applicable to a
          specific purchase, rental, or service, please contact us.
        </p>
      </div>
    </div>
  );
}
