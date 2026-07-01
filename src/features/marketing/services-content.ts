/**
 * Content for the three service offerings shown as tabs on /services.
 * Keyed by a URL-friendly `id` used in `?tab=<id>` deep links (driven from the
 * navbar Services dropdown).
 */
export type ServiceTab = {
  id: "consultation" | "selling" | "rental";
  label: string;
  headline: string;
  intro: string;
  points: string[];
  ctaLabel: string;
  ctaHref: string;
};

export const SERVICE_TABS: ServiceTab[] = [
  {
    id: "consultation",
    label: "Consultation",
    headline: "Power consultation & load planning",
    intro:
      "Not sure what you need? Our engineers assess your load profile, site conditions, and growth plans to recommend the right generator, sizing, and configuration — so you never over- or under-spec.",
    points: [
      "On-site load assessment and power audit",
      "Right-sizing (KVA) for your exact requirement",
      "Fuel-type and silent/open-type recommendation",
      "Installation, transfer switch, and synchronisation advice",
      "Total cost of ownership and ROI guidance",
    ],
    ctaLabel: "Request a consultation",
    ctaHref: "/quote",
  },
  {
    id: "selling",
    label: "Selling",
    headline: "Generator sales — leading brands, genuine units",
    intro:
      "We supply diesel, petrol, silent, and open-type generators from the world's most trusted brands, with full warranty, installation, and after-sales support across Pakistan.",
    points: [
      "Perkins, Cummins, FG Wilson, John Deere and more",
      "Brand-new units with manufacturer warranty",
      "Delivery, installation, and commissioning",
      "Genuine spare parts and consumables",
      "Flexible payment and financing options",
    ],
    ctaLabel: "Browse generators",
    ctaHref: "/products",
  },
  {
    id: "rental",
    label: "Rental",
    headline: "Short & long-term generator rentals",
    intro:
      "Need temporary power for an event, project, or standby cover? Our rental fleet ships with transport, installation, fuel planning, and 24/7 support — for a day, a month, or a year.",
    points: [
      "Daily, monthly, and long-term rental plans",
      "Delivery, installation, and removal included",
      "Standby and prime-power options",
      "24/7 technical support and rapid replacement",
      "Load planning and transport handled for you",
    ],
    ctaLabel: "Request a rental quote",
    ctaHref: "/rental",
  },
];
