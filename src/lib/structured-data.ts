/**
 * JSON-LD structured data builders (TRD §18 — SEO). Each returns a plain
 * schema.org object to be rendered via the <JsonLd> component.
 */
import { siteConfig } from "@/constants/site";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

type Json = Record<string, unknown>;

export function organizationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: siteConfig.name,
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    sameAs: Object.values(siteConfig.social).filter((v) => v && v !== "#"),
  };
}

export function localBusinessSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: siteConfig.name,
    url: SITE_URL,
    image: absoluteUrl("/opengraph-image"),
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
      addressCountry: "PK",
    },
    priceRange: "$$$",
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteConfig.name,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(input: {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  brand?: string | null;
  sku?: string | null;
  price: number;
  inStock: boolean;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description ?? undefined,
    image: input.image ? absoluteUrl(input.image) : undefined,
    sku: input.sku ?? undefined,
    brand: input.brand ? { "@type": "Brand", name: input.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${input.slug}`),
      priceCurrency: "PKR",
      price: input.price,
      availability: input.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#organization` },
    },
  };
}

export function articleSchema(input: {
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  publishedTime?: Date | string | null;
  modifiedTime?: Date | string | null;
  author?: string | null;
}): Json {
  const toIso = (d?: Date | string | null) =>
    d ? new Date(d).toISOString() : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description ?? undefined,
    image: input.image ? absoluteUrl(input.image) : undefined,
    datePublished: toIso(input.publishedTime),
    dateModified: toIso(input.modifiedTime) ?? toIso(input.publishedTime),
    author: { "@type": "Organization", name: input.author ?? siteConfig.name },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: absoluteUrl(`/blog/${input.slug}`),
  };
}

export function faqSchema(items: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
