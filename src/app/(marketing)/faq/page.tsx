import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getFAQs } from "@/services/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about our generators, rentals, and service.",
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await getFAQs();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "FAQ" }]} />
      <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight">
        Frequently asked questions
      </h1>

      <Accordion type="single" collapsible className="mt-8">
        {faqs.map((f) => (
          <AccordionItem key={f.id} value={f.id}>
            <AccordionTrigger>{f.question}</AccordionTrigger>
            <AccordionContent>{f.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-2xl bg-secondary/40 p-8 text-center">
        <h2 className="font-heading text-xl font-bold">
          Still have questions?
        </h2>
        <p className="mt-2 text-muted-foreground">Our team is happy to help.</p>
        <Button asChild className="mt-5">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
