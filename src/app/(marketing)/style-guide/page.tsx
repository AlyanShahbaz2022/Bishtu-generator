"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Counter } from "@/components/motion/counter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const swatches = [
  { name: "background", className: "bg-background border" },
  { name: "card", className: "bg-card" },
  { name: "primary", className: "bg-primary" },
  { name: "accent", className: "bg-accent" },
  { name: "secondary", className: "bg-secondary" },
  { name: "muted", className: "bg-muted" },
  { name: "destructive", className: "bg-destructive" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-10">
      <h2 className="mb-6 font-heading text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Style Guide" }]} className="mb-6" />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        Design System
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tech &amp; Tune component and token reference (Phase 3).
      </p>

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {swatches.map((s) => (
            <div key={s.name} className="space-y-2">
              <div className={`h-16 rounded-xl border-border ${s.className}`} />
              <p className="text-xs text-muted-foreground">{s.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-3">
          <h1 className="font-heading text-5xl font-extrabold">Heading 1</h1>
          <h2 className="font-heading text-3xl font-bold">Heading 2</h2>
          <h3 className="font-heading text-2xl font-semibold">Heading 3</h3>
          <p className="text-lg">
            Body large — premium industrial power solutions.
          </p>
          <p className="text-sm text-muted-foreground">
            Body small / muted — supporting copy.
          </p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">
              Extra large
              <ArrowRight />
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="demo">Email</Label>
          <Input id="demo" type="email" placeholder="you@company.com" />
          <p className="text-xs text-muted-foreground">Inline helper text.</p>
        </div>
      </Section>

      <Section title="Cards">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Perkins 20 KVA</CardTitle>
            <CardDescription>Diesel generator</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">PKR 950,000</p>
            <Button className="mt-4 w-full">Add to cart</Button>
          </CardContent>
        </Card>
      </Section>

      <Section title="Accordion">
        <Accordion type="single" collapsible className="max-w-lg">
          <AccordionItem value="1">
            <AccordionTrigger>What brands do you carry?</AccordionTrigger>
            <AccordionContent>
              Perkins, Cummins, FG Wilson, John Deere and more.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>Do you offer rentals?</AccordionTrigger>
            <AccordionContent>
              Yes — short and long-term rentals with installation.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Skeletons">
        <div className="max-w-sm space-y-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </Section>

      <Section title="Counters">
        <p className="font-heading text-4xl font-extrabold text-primary">
          <Counter to={2000} suffix="+" />
        </p>
      </Section>

      <Section title="Toasts">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => toast.success("Saved successfully")}>
            Success toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Something went wrong")}
          >
            Error toast
          </Button>
        </div>
      </Section>
    </div>
  );
}
