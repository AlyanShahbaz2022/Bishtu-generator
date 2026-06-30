/**
 * Global site configuration.
 * Static brand/SEO defaults. Dynamic values (managed in the admin "Website
 * Settings" module — see DATABASE_SCHEMA.md) will override these at runtime.
 */
export const siteConfig = {
  name: "Tech & Tune",
  shortName: "Tech & Tune",
  description:
    "Premium industrial power solutions — diesel & petrol generator sales, rentals, maintenance, and genuine spare parts.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "en",
  // Placeholder defaults — overridden at runtime by the admin "Website
  // Settings" module (see DATABASE_SCHEMA.md).
  contact: {
    phone: "+92 300 1234567",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923001234567",
    email: "info@techandtune.pk",
    address: "Lahore, Pakistan",
  },
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
  },
  nav: [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Products", href: "/products" },
    { title: "Services", href: "/services" },
    { title: "Industries", href: "/industries" },
    { title: "Projects", href: "/projects" },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
