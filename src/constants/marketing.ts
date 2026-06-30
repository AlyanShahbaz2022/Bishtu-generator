import {
  Building2,
  Factory,
  Fuel,
  HardHat,
  Headset,
  HeartPulse,
  PackageCheck,
  Server,
  ShieldCheck,
  Truck,
  Tractor,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const services: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    icon: Zap,
    title: "Generator Sales",
    description:
      "Diesel, petrol, silent & open-type generators from leading brands.",
    href: "/products",
  },
  {
    icon: Truck,
    title: "Generator Rentals",
    description:
      "Flexible short & long-term rentals with delivery and installation.",
    href: "/rental",
  },
  {
    icon: Wrench,
    title: "Repair & Maintenance",
    description:
      "Scheduled servicing and rapid repairs by certified engineers.",
    href: "/service",
  },
  {
    icon: PackageCheck,
    title: "Overhauling",
    description:
      "Complete engine and alternator overhauls to restore performance.",
    href: "/service",
  },
  {
    icon: Fuel,
    title: "Genuine Spare Parts",
    description: "OEM filters, alternators, controllers and engine components.",
    href: "/category/genuine-spare-parts",
  },
  {
    icon: Headset,
    title: "Power Consultation",
    description: "Expert load assessment and power solution recommendations.",
    href: "/quote",
  },
];

export const whyChoose: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "Genuine & warrantied",
    body: "Authorized stock backed by manufacturer warranties.",
  },
  {
    icon: Wrench,
    title: "Certified engineers",
    body: "Skilled technicians for installation and service.",
  },
  {
    icon: Truck,
    title: "Nationwide delivery",
    body: "Fast logistics and on-site commissioning across Pakistan.",
  },
  {
    icon: Headset,
    title: "24/7 support",
    body: "Round-the-clock assistance for critical power.",
  },
];

export const industries: { icon: LucideIcon; title: string }[] = [
  { icon: Factory, title: "Manufacturing" },
  { icon: HeartPulse, title: "Hospitals" },
  { icon: Server, title: "Data Centers" },
  { icon: HardHat, title: "Construction" },
  { icon: Building2, title: "Commercial" },
  { icon: Tractor, title: "Agriculture" },
];

export const stats: { to: number; suffix: string; label: string }[] = [
  { to: 15, suffix: "+", label: "Years of expertise" },
  { to: 2000, suffix: "+", label: "Generators installed" },
  { to: 2000, suffix: " KVA", label: "Power range" },
  { to: 24, suffix: "/7", label: "Service support" },
];
