import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Privacy Policy" }]} />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
        <p>
          We respect your privacy. This page describes what information we
          collect and how we use it. We collect contact details you submit
          through our forms (quote, rental, service, and contact) to respond to
          your enquiries and provide our services.
        </p>
        <p>
          We do not sell your personal information. Data is stored securely and
          retained only as long as necessary to serve you. For any privacy
          request, contact us via the details on our Contact page.
        </p>
      </div>
    </div>
  );
}
