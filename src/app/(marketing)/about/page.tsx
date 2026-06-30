import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Counter } from "@/components/motion/counter";
import { Button } from "@/components/ui/button";
import { stats, whyChoose } from "@/constants/marketing";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tech & Tune is a premium industrial power solutions provider — generator sales, rentals, maintenance, and genuine spare parts.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "About" }]} />
      <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight">
        Powering Pakistan&apos;s industry
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
        Tech &amp; Tune is a premium industrial power solutions company
        specializing in diesel and petrol generator sales, rentals, repair &amp;
        maintenance, overhauling, and genuine spare parts. We help industrial,
        commercial, and critical-infrastructure clients keep the lights on —
        reliably.
      </p>

      <div className="my-12 grid grid-cols-2 gap-8 border-y border-border py-10 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-heading text-4xl font-extrabold text-primary">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-heading text-2xl font-bold">What sets us apart</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {whyChoose.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <h3 className="font-heading font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Button asChild size="lg">
          <Link href="/quote">Request a quote</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
