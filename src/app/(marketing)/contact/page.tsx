import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/features/marketing/contact-form";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Tech & Tune for sales, rentals, and service.",
};

const wa = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, "")}`;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <Breadcrumbs items={[{ title: "Contact" }]} />
      <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight">
        Contact us
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Reach our team for sales, rentals, service, or technical advice.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="pt-6">
            <ContactForm />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <ContactRow
            icon={Phone}
            label="Call us"
            value={siteConfig.contact.phone}
            href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
          />
          <ContactRow
            icon={MessageCircle}
            label="WhatsApp"
            value={siteConfig.contact.whatsapp}
            href={wa}
          />
          <ContactRow
            icon={Mail}
            label="Email"
            value={siteConfig.contact.email}
            href={`mailto:${siteConfig.contact.email}`}
          />
          <ContactRow
            icon={MapPin}
            label="Address"
            value={siteConfig.contact.address}
          />
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 py-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
  return href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {content}
    </a>
  ) : (
    content
  );
}
