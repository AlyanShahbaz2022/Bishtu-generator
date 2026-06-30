import { Mail, MapPin, Phone, Zap } from "lucide-react";
import Link from "next/link";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/layout/social-icons";
import { footerColumns } from "@/constants/navigation";
import { siteConfig } from "@/constants/site";

const socials = [
  { label: "Facebook", href: siteConfig.social.facebook, Icon: FacebookIcon },
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
    Icon: InstagramIcon,
  },
  { label: "LinkedIn", href: siteConfig.social.linkedin, Icon: LinkedinIcon },
  { label: "YouTube", href: siteConfig.social.youtube, Icon: YoutubeIcon },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="size-5" />
              </span>
              <span className="font-heading text-lg font-extrabold tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h3 className="font-heading text-sm font-semibold">
                {column.heading}
              </h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact + newsletter */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-heading text-sm font-semibold">Get in touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {siteConfig.contact.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <a
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                  className="hover:text-foreground"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-foreground"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>
            <p className="mt-5 text-sm font-medium">
              Subscribe to our newsletter
            </p>
            <div className="mt-2">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
