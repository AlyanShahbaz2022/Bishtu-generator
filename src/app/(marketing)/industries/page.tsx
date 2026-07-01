import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { industries } from "@/constants/marketing";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Industries",
  description:
    "Power solutions for manufacturing, healthcare, data centers, construction, and more.",
  path: "/industries",
});

const DETAILS: Record<string, string> = {
  Manufacturing:
    "Continuous and standby power to keep production lines running.",
  Hospitals:
    "Redundant critical power for theatres, ICUs, and life-support systems.",
  "Data Centers":
    "High-reliability backup power with synchronization and monitoring.",
  Construction: "Rugged rental and site power across active project locations.",
  Commercial: "Standby power for offices, retail, hospitality, and facilities.",
  Agriculture: "Dependable power for farms, irrigation, and processing.",
};

export default function IndustriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Industries" }]} />
      <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight">
        Industries we serve
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Tailored power solutions for the sectors that depend on uninterrupted
        energy.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map(({ icon: Icon, title }) => (
          <Card key={title}>
            <CardContent className="pt-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-4 font-heading text-lg font-semibold">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {DETAILS[title] ??
                  "Reliable power solutions tailored to your sector."}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
