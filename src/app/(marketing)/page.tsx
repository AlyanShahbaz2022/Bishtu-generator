import {
  ArrowRight,
  Gauge,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Counter } from "@/components/motion/counter";
import { FadeIn } from "@/components/motion/fade-in";
import { HoverLift } from "@/components/motion/hover-lift";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { to: 15, suffix: "+", label: "Years of expertise" },
  { to: 2000, suffix: "+", label: "Generators installed" },
  { to: 2000, suffix: " KVA", label: "Power range" },
  { to: 24, suffix: "/7", label: "Service support" },
];

const highlights = [
  {
    Icon: ShieldCheck,
    title: "Genuine & warrantied",
    body: "Authorized stock from Perkins, Cummins, FG Wilson and more — every unit backed by a manufacturer warranty.",
  },
  {
    Icon: Wrench,
    title: "Full lifecycle service",
    body: "Sales, rentals, installation, maintenance, and overhauling handled by certified engineers.",
  },
  {
    Icon: Truck,
    title: "Nationwide delivery",
    body: "Fast logistics and on-site commissioning across Pakistan for industrial and commercial sites.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center lg:px-8 lg:py-32">
          <FadeIn>
            <Badge variant="secondary" className="gap-2">
              <Zap className="size-3.5 text-primary" />
              Premium Industrial Power Solutions
            </Badge>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Reliable power for mission-critical operations
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
              Diesel &amp; petrol generator sales, rentals, maintenance, and
              genuine spare parts — engineered reliability from {"Tech & Tune"}.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="xl">
                <Link href="/products">
                  Explore Generators
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/quote">Request a Quote</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <ScrollReveal key={stat.label} className="text-center">
              <p className="font-heading text-4xl font-extrabold text-primary">
                <Counter to={stat.to} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Why choose {"Tech & Tune"}
          </h2>
          <p className="mt-4 text-muted-foreground">
            Engineering excellence and dependable support at every step.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {highlights.map(({ Icon, title, body }, index) => (
            <ScrollReveal key={title} delay={index * 0.1}>
              <HoverLift className="h-full">
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg font-semibold">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </CardContent>
                </Card>
              </HoverLift>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 lg:px-8">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 to-transparent p-10 text-center lg:p-16">
            <Gauge className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
              Need help sizing the right generator?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Our power consultants will recommend the ideal solution for your
              load requirements.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/quote">Get a free consultation</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
