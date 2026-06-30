/**
 * Navigation data for the global chrome (navbar mega menu, footer columns).
 * Category/service slugs mirror the Phase 1 seed (`prisma/seed.ts`); these will
 * later be sourced dynamically from the database in the catalog phases.
 */

export type NavLink = { title: string; href: string; description?: string };

/** Products mega-menu groups. */
export const productMenu: { heading: string; links: NavLink[] }[] = [
  {
    heading: "By fuel type",
    links: [
      {
        title: "Diesel Generators",
        href: "/category/diesel-generators",
        description: "5–2000 KVA industrial diesel sets.",
      },
      {
        title: "Petrol Generators",
        href: "/category/petrol-generators",
        description: "Portable and standby petrol units.",
      },
    ],
  },
  {
    heading: "By enclosure",
    links: [
      {
        title: "Silent Generators",
        href: "/category/silent-generators",
        description: "Sound-attenuated canopy sets.",
      },
      {
        title: "Open Type Generators",
        href: "/category/open-type-generators",
        description: "Skid-mounted open frame sets.",
      },
    ],
  },
  {
    heading: "Parts & add-ons",
    links: [
      {
        title: "Generator Accessories",
        href: "/category/generator-accessories",
        description: "ATS panels, fuel tanks, controllers.",
      },
      {
        title: "Genuine Spare Parts",
        href: "/category/genuine-spare-parts",
        description: "OEM filters, alternators, engine parts.",
      },
    ],
  },
];

/** Services offered (mirrors the UI brief overview). */
export const servicesMenu: NavLink[] = [
  { title: "Generator Sales", href: "/services#sales" },
  { title: "Generator Rentals", href: "/services#rental" },
  { title: "Repair & Maintenance", href: "/services#repair" },
  { title: "Generator Overhauling", href: "/services#overhaul" },
  { title: "Genuine Spare Parts", href: "/services#parts" },
  { title: "Power Consultation", href: "/services#consultation" },
];

/** Footer link columns. */
export const footerColumns: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Company",
    links: [
      { title: "About Us", href: "/about" },
      { title: "Projects", href: "/projects" },
      { title: "Industries", href: "/industries" },
      { title: "Blog", href: "/blog" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Products",
    links: [
      { title: "Diesel Generators", href: "/category/diesel-generators" },
      { title: "Petrol Generators", href: "/category/petrol-generators" },
      { title: "Silent Generators", href: "/category/silent-generators" },
      { title: "Spare Parts", href: "/category/genuine-spare-parts" },
      { title: "All Products", href: "/products" },
    ],
  },
  {
    heading: "Services",
    links: servicesMenu.slice(0, 5),
  },
];
