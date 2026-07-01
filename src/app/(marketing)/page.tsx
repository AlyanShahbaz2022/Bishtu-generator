import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Counter } from "@/components/motion/counter";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroCarousel } from "@/features/marketing/hero-carousel";
import { ProductGrid } from "@/features/products/components/product-grid";
import { industries, services, stats, whyChoose } from "@/constants/marketing";
import {
  getActiveBanners,
  getBrands,
  getFAQs,
  getFeaturedCategories,
  getFeaturedProjects,
  getTestimonials,
} from "@/services/content";
import { getFeaturedProducts } from "@/services/products";

// Rendered per-request: reads live catalog/content data (avoids build-time
// prerender hitting the connection-limited DB pooler). Phase 9 can layer ISR.
export const dynamic = "force-dynamic";

/** Resolve a data fetch to a fallback if the DB is briefly unreachable, so a
 *  transient pooler blip degrades the homepage gracefully instead of crashing. */
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [banners, categories, products, brands, projects, testimonials, faqs] =
    await Promise.all([
      safe(getActiveBanners(), []),
      safe(getFeaturedCategories(6), []),
      safe(getFeaturedProducts(6), []),
      safe(getBrands(), []),
      safe(getFeaturedProjects(3), []),
      safe(getTestimonials(), []),
      safe(getFAQs(), []),
    ]);

  return (
    <div className="flex flex-col">
      {/* Hero — pull up under the transparent navbar */}
      <div className="-mt-16">
        <HeroCarousel banners={banners} />
      </div>

      {/* Trusted brands */}
      {brands.length > 0 && (
        <section className="border-y border-border">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-8 lg:px-8">
            <span className="text-sm text-muted-foreground">
              Trusted brands:
            </span>
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/brand/${b.slug}`}
                className="font-heading text-lg font-bold text-muted-foreground hover:text-foreground"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured categories */}
      <Section
        heading="Shop by category"
        subheading="Find the right power solution for your needs."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <ScrollReveal key={c.id}>
              <Link href={`/category/${c.slug}`}>
                <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        sizes="(max-width:1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-primary/20 to-transparent" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant="secondary">{c.productCount}</Badge>
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Featured products */}
      {products.length > 0 && (
        <Section
          heading="Featured generators"
          subheading="Popular, in-stock models ready to ship."
          action={{ label: "View all products", href: "/products" }}
        >
          <ProductGrid products={products} />
        </Section>
      )}

      {/* Services */}
      <Section
        heading="Our services"
        subheading="End-to-end power solutions, from supply to lifetime support."
        muted
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, description, href }) => (
            <ScrollReveal key={title}>
              <Link href={href}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardContent className="pt-6">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-lg font-semibold">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Why choose us */}
      <Section heading="Why choose Tech & Tune">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map(({ icon: Icon, title, body }) => (
            <ScrollReveal key={title} className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 font-heading font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Industries */}
      <Section heading="Industries we serve" muted>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {industries.map(({ icon: Icon, title }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-xl border border-border p-6 text-center"
            >
              <Icon className="size-7 text-primary" />
              <span className="text-sm font-medium">{title}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Projects */}
      {projects.length > 0 && (
        <Section
          heading="Recent projects"
          action={{ label: "All projects", href: "/projects" }}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {projects.map((p) => (
              <ScrollReveal key={p.id}>
                <Link href={`/projects/${p.slug}`}>
                  <Card className="group h-full overflow-hidden p-0 transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {p.images[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.title}
                          fill
                          sizes="(max-width:768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground">
                        {p.location} · {p.generatorCapacity}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-medium">
                        {p.title}
                      </h3>
                    </div>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </Section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Section heading="What our clients say" muted>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.id} className="h-full">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={
                          i < t.rating
                            ? "size-4 fill-accent text-accent"
                            : "size-4 text-muted-foreground"
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">“{t.message}”</p>
                  <p className="mt-4 text-sm font-semibold">{t.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[t.designation, t.company].filter(Boolean).join(", ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Statistics */}
      <section className="border-y border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 lg:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <ScrollReveal key={s.label} className="text-center">
              <p className="font-heading text-4xl font-extrabold text-primary">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <Section heading="Frequently asked questions">
          <Accordion type="single" collapsible className="mx-auto max-w-3xl">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                <AccordionContent>{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      )}

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 to-transparent p-10 text-center lg:p-16">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Ready to power your operations?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Talk to our power consultants for a tailored recommendation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/quote">
                Request a quote
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  heading,
  subheading,
  children,
  action,
  muted,
}: {
  heading: string;
  subheading?: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  muted?: boolean;
}) {
  return (
    <section className={muted ? "bg-secondary/30" : undefined}>
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
        <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-3 max-w-2xl text-muted-foreground">
                {subheading}
              </p>
            )}
          </div>
          {action && (
            <Button asChild variant="ghost">
              <Link href={action.href}>
                {action.label}
                <ArrowRight />
              </Link>
            </Button>
          )}
        </ScrollReveal>
        {children}
      </div>
    </section>
  );
}
