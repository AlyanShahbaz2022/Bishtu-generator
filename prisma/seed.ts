import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";

const ADMIN_EMAIL = "admin@techandtune.pk";
const ADMIN_PASSWORD = "Admin@12345";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Roles per DATABASE_SCHEMA.md / TRD §7.
const ROLES = [
  { name: "Super Admin", description: "Full unrestricted access." },
  { name: "Admin", description: "Manages catalog, orders, and content." },
  { name: "Sales Manager", description: "Handles quotes, rentals, and leads." },
  { name: "Engineer", description: "Handles service requests on-site." },
  { name: "Dealer", description: "Reseller / partner account." },
  { name: "Customer", description: "Standard storefront customer." },
];

// Top-level product categories from PRD.
const CATEGORIES = [
  { name: "Diesel Generators", slug: "diesel-generators" },
  { name: "Petrol Generators", slug: "petrol-generators" },
  { name: "Silent Generators", slug: "silent-generators" },
  { name: "Open Type Generators", slug: "open-type-generators" },
  { name: "Generator Accessories", slug: "generator-accessories" },
  { name: "Genuine Spare Parts", slug: "genuine-spare-parts" },
];

// Brands from DATABASE_SCHEMA.md examples.
const BRANDS = [
  { name: "Perkins", slug: "perkins", country: "United Kingdom" },
  { name: "Cummins", slug: "cummins", country: "United States" },
  { name: "John Deere", slug: "john-deere", country: "United States" },
  { name: "FG Wilson", slug: "fg-wilson", country: "United Kingdom" },
];

// Default website settings (admin "Website Settings" module).
const SETTINGS: { key: string; value: unknown; group: string }[] = [
  { key: "company_name", value: "Tech & Tune", group: "general" },
  { key: "company_email", value: "info@techandtune.pk", group: "contact" },
  { key: "company_phone", value: "", group: "contact" },
  { key: "whatsapp_number", value: "", group: "contact" },
  { key: "company_address", value: "", group: "contact" },
  { key: "social_links", value: {}, group: "social" },
  {
    key: "seo_defaults",
    value: {
      title: "Tech & Tune — Premium Industrial Power Solutions",
      description:
        "Diesel & petrol generator sales, rentals, maintenance, and genuine spare parts.",
    },
    group: "seo",
  },
];

async function main() {
  console.log("Seeding database…");

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log(`  ✓ ${ROLES.length} roles`);

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`);

  for (const brand of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, country: brand.country },
      create: brand,
    });
  }
  console.log(`  ✓ ${BRANDS.length} brands`);

  for (const setting of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value as object, group: setting.group },
      create: {
        key: setting.key,
        value: setting.value as object,
        group: setting.group,
      },
    });
  }
  console.log(`  ✓ ${SETTINGS.length} settings`);

  // Resolve category/brand slugs → ids so products can reference them by slug.
  const categoryRows = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const brandRows = await prisma.brand.findMany({
    select: { id: true, slug: true },
  });
  const categoryId = new Map(categoryRows.map((c) => [c.slug, c.id]));
  const brandId = new Map(brandRows.map((b) => [b.slug, b.id]));

  type SeedProduct = {
    name: string;
    slug: string;
    sku: string;
    category: string;
    brand?: string;
    price: string;
    salePrice?: string;
    kva?: number;
    fuelType?: "DIESEL" | "PETROL" | "GAS";
    generatorType?: "DIESEL" | "PETROL" | "SILENT" | "OPEN_TYPE";
    engineModel?: string;
    stock: number;
    featured?: boolean;
  };

  const demoProducts: SeedProduct[] = [
    {
      name: "Perkins 20 KVA Diesel Generator",
      slug: "perkins-20-kva-diesel-generator",
      sku: "TT-DSL-PRK-020",
      category: "diesel-generators",
      brand: "perkins",
      price: "950000",
      kva: 20,
      fuelType: "DIESEL",
      generatorType: "OPEN_TYPE",
      engineModel: "Perkins 404D-22G",
      stock: 6,
      featured: true,
    },
    {
      name: "Cummins 100 KVA Diesel Generator",
      slug: "cummins-100-kva-diesel-generator",
      sku: "TT-DSL-CMN-100",
      category: "diesel-generators",
      brand: "cummins",
      price: "3850000",
      salePrice: "3650000",
      kva: 100,
      fuelType: "DIESEL",
      generatorType: "OPEN_TYPE",
      engineModel: "Cummins 6BTAA5.9-G2",
      stock: 4,
      featured: true,
    },
    {
      name: "FG Wilson 30 KVA Silent Diesel Generator",
      slug: "fg-wilson-30-kva-silent-diesel-generator",
      sku: "TT-SIL-FGW-030",
      category: "silent-generators",
      brand: "fg-wilson",
      price: "1450000",
      kva: 30,
      fuelType: "DIESEL",
      generatorType: "SILENT",
      engineModel: "Perkins 1103A-33G",
      stock: 8,
      featured: true,
    },
    {
      name: "Perkins 250 KVA Diesel Generator",
      slug: "perkins-250-kva-diesel-generator",
      sku: "TT-DSL-PRK-250",
      category: "diesel-generators",
      brand: "perkins",
      price: "7200000",
      kva: 250,
      fuelType: "DIESEL",
      generatorType: "OPEN_TYPE",
      engineModel: "Perkins 1506A-E88TAG5",
      stock: 3,
      featured: true,
    },
    {
      name: "Cummins 500 KVA Silent Diesel Generator",
      slug: "cummins-500-kva-silent-diesel-generator",
      sku: "TT-SIL-CMN-500",
      category: "silent-generators",
      brand: "cummins",
      price: "14500000",
      kva: 500,
      fuelType: "DIESEL",
      generatorType: "SILENT",
      engineModel: "Cummins QSX15-G8",
      stock: 2,
    },
    {
      name: "John Deere 60 KVA Open Type Generator",
      slug: "john-deere-60-kva-open-type-generator",
      sku: "TT-OPN-JDE-060",
      category: "open-type-generators",
      brand: "john-deere",
      price: "2150000",
      kva: 60,
      fuelType: "DIESEL",
      generatorType: "OPEN_TYPE",
      engineModel: "John Deere 4045TF",
      stock: 5,
    },
    {
      name: "FG Wilson 150 KVA Silent Diesel Generator",
      slug: "fg-wilson-150-kva-silent-diesel-generator",
      sku: "TT-SIL-FGW-150",
      category: "silent-generators",
      brand: "fg-wilson",
      price: "5200000",
      salePrice: "4950000",
      kva: 150,
      fuelType: "DIESEL",
      generatorType: "SILENT",
      engineModel: "Perkins 1106A-70TAG4",
      stock: 4,
      featured: true,
    },
    {
      name: "Tech & Tune 7 KVA Petrol Generator",
      slug: "tech-and-tune-7-kva-petrol-generator",
      sku: "TT-PET-TNT-007",
      category: "petrol-generators",
      price: "185000",
      salePrice: "169000",
      kva: 7,
      fuelType: "PETROL",
      generatorType: "PETROL",
      engineModel: "TNT-G390",
      stock: 15,
    },
    {
      name: "Tech & Tune 10 KVA Petrol Generator",
      slug: "tech-and-tune-10-kva-petrol-generator",
      sku: "TT-PET-TNT-010",
      category: "petrol-generators",
      price: "265000",
      kva: 10,
      fuelType: "PETROL",
      generatorType: "PETROL",
      engineModel: "TNT-G420",
      stock: 11,
    },
    {
      name: "Cummins 750 KVA Open Type Generator",
      slug: "cummins-750-kva-open-type-generator",
      sku: "TT-OPN-CMN-750",
      category: "open-type-generators",
      brand: "cummins",
      price: "21500000",
      kva: 750,
      fuelType: "DIESEL",
      generatorType: "OPEN_TYPE",
      engineModel: "Cummins KTA38-G5",
      stock: 1,
    },
    {
      name: "ATS Control Panel 250A",
      slug: "ats-control-panel-250a",
      sku: "TT-ACC-ATS-250",
      category: "generator-accessories",
      price: "145000",
      stock: 20,
    },
    {
      name: "Perkins Genuine Fuel Filter Kit",
      slug: "perkins-genuine-fuel-filter-kit",
      sku: "TT-SPR-PRK-FFK",
      category: "genuine-spare-parts",
      brand: "perkins",
      price: "8500",
      stock: 50,
    },
  ];

  for (const p of demoProducts) {
    const isGenerator = Boolean(p.kva);
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        featured: p.featured ?? false,
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        kva: p.kva ?? null,
        fuelType: p.fuelType ?? null,
        generatorType: p.generatorType ?? null,
        engineModel: p.engineModel ?? null,
        frequency: isGenerator ? "50Hz" : null,
        voltage: isGenerator ? "400V / 230V" : null,
        phase: isGenerator
          ? p.kva && p.kva <= 10
            ? "1-Phase"
            : "3-Phase"
          : null,
        warranty: "1 Year",
        shortDescription: `${p.name} — genuine, warrantied, and ready for industrial and commercial use.`,
        description:
          "Engineered for reliable, continuous power. Supplied, installed, and serviced by Tech & Tune with genuine parts and nationwide support.",
        featured: p.featured ?? false,
        published: true,
        categoryId: categoryId.get(p.category)!,
        brandId: p.brand ? brandId.get(p.brand) : null,
        inventory: {
          create: { quantity: p.stock, available: p.stock, reorderLevel: 2 },
        },
        images: {
          create: [
            {
              url: `https://picsum.photos/seed/${p.slug}/900/700`,
              altText: p.name,
              sortOrder: 0,
            },
            {
              url: `https://picsum.photos/seed/${p.slug}-alt/900/700`,
              altText: `${p.name} — alternate view`,
              sortOrder: 1,
            },
          ],
        },
        specifications: {
          create: isGenerator
            ? [
                { title: "Rated Power", value: `${p.kva} KVA` },
                { title: "Engine", value: p.engineModel ?? "—" },
                { title: "Fuel Type", value: p.fuelType ?? "—" },
                { title: "Frequency", value: "50Hz" },
                { title: "Voltage", value: "400V / 230V" },
              ]
            : [
                { title: "Type", value: "Accessory / Spare" },
                { title: "Warranty", value: "1 Year" },
              ],
        },
      },
    });
  }
  console.log(`  ✓ ${demoProducts.length} demo products`);

  // ── Admin user (email/password via Better Auth credential account) ──
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "Super Admin" },
  });
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "super-admin", roleId: superAdminRole?.id },
    create: {
      name: "Site Admin",
      firstName: "Site",
      lastName: "Admin",
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: "super-admin",
      roleId: superAdminRole?.id,
    },
  });
  const hasCredential = await prisma.account.findFirst({
    where: { userId: admin.id, providerId: "credential" },
  });
  if (!hasCredential) {
    await prisma.account.create({
      data: {
        userId: admin.id,
        accountId: admin.id,
        providerId: "credential",
        password: await hashPassword(ADMIN_PASSWORD),
      },
    });
  }
  console.log(`  ✓ admin user (${ADMIN_EMAIL} / ${ADMIN_PASSWORD})`);

  // ── Starter navigation tree (only if empty) ──
  if ((await prisma.navItem.count()) === 0) {
    const navTree: {
      label: string;
      children: { label: string; categorySlug: string }[];
    }[] = [
      {
        label: "Generators",
        children: [
          { label: "Diesel Generators", categorySlug: "diesel-generators" },
          { label: "Petrol Generators", categorySlug: "petrol-generators" },
          { label: "Silent Generators", categorySlug: "silent-generators" },
          {
            label: "Open Type Generators",
            categorySlug: "open-type-generators",
          },
        ],
      },
      {
        label: "Parts & Accessories",
        children: [
          {
            label: "Generator Accessories",
            categorySlug: "generator-accessories",
          },
          { label: "Genuine Spare Parts", categorySlug: "genuine-spare-parts" },
        ],
      },
    ];

    let deptOrder = 0;
    for (const dept of navTree) {
      const department = await prisma.navItem.create({
        data: { label: dept.label, level: 0, sortOrder: deptOrder++ },
      });
      let childOrder = 0;
      for (const child of dept.children) {
        await prisma.navItem.create({
          data: {
            label: child.label,
            level: 1,
            parentId: department.id,
            categoryId: categoryId.get(child.categorySlug),
            href: `/category/${child.categorySlug}`,
            sortOrder: childOrder++,
          },
        });
      }
    }
    console.log("  ✓ starter navigation tree");
  }

  // ── Marketing content (idempotent by count / slug) ──
  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({
      data: [
        {
          title: "Reliable power for mission-critical operations",
          subtitle:
            "Diesel & petrol generator sales, rentals, maintenance, and genuine spare parts.",
          image: "https://picsum.photos/seed/tt-hero-1/1600/900",
          ctaLabel: "Explore generators",
          ctaHref: "/products",
          sortOrder: 0,
        },
        {
          title: "Nationwide rentals & 24/7 service",
          subtitle: "Certified engineers, genuine parts, fast response.",
          image: "https://picsum.photos/seed/tt-hero-2/1600/900",
          ctaLabel: "Request a quote",
          ctaHref: "/quote",
          sortOrder: 1,
        },
      ],
    });
    console.log("  ✓ banners");
  }

  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          customerName: "Imran Khalid",
          company: "Pearl Textiles",
          designation: "Plant Manager",
          rating: 5,
          message:
            "Tech & Tune sized and installed our 250 KVA standby set flawlessly. Zero downtime since.",
          published: true,
          sortOrder: 0,
        },
        {
          customerName: "Dr. Sana Riaz",
          company: "City Care Hospital",
          designation: "Facilities Director",
          rating: 5,
          message:
            "Their maintenance team is responsive and professional. Critical power we can rely on.",
          published: true,
          sortOrder: 1,
        },
        {
          customerName: "Bilal Ahmed",
          company: "Skyline Constructions",
          designation: "Project Lead",
          rating: 5,
          message:
            "Rented multiple units across sites. Delivery, install and support were excellent.",
          published: true,
          sortOrder: 2,
        },
      ],
    });
    console.log("  ✓ testimonials");
  }

  const PROJECTS = [
    {
      title: "500 KVA Standby Power — Pearl Textiles",
      slug: "pearl-textiles-500-kva",
      client: "Pearl Textiles",
      location: "Faisalabad",
      generatorBrand: "Cummins",
      generatorCapacity: "500 KVA",
      description:
        "Turnkey standby power installation with synchronization panel and remote monitoring.",
      featured: true,
    },
    {
      title: "Hospital Critical Power — City Care",
      slug: "city-care-hospital-power",
      client: "City Care Hospital",
      location: "Lahore",
      generatorBrand: "Perkins",
      generatorCapacity: "250 KVA",
      description:
        "Redundant power for operating theatres and ICU with automatic transfer switching.",
      featured: true,
    },
    {
      title: "Multi-site Rental Fleet — Skyline",
      slug: "skyline-rental-fleet",
      client: "Skyline Constructions",
      location: "Islamabad",
      generatorBrand: "FG Wilson",
      generatorCapacity: "60–150 KVA",
      description: "Managed rental fleet supporting active construction sites.",
      featured: false,
    },
  ];
  for (const p of PROJECTS) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        images: [`https://picsum.photos/seed/${p.slug}/1200/800`],
      },
    });
  }
  console.log(`  ✓ ${PROJECTS.length} projects`);

  if ((await prisma.fAQ.count()) === 0) {
    await prisma.fAQ.createMany({
      data: [
        {
          question: "Do you offer installation and commissioning?",
          answer:
            "Yes — our engineers handle delivery, installation, and commissioning nationwide.",
          sortOrder: 0,
        },
        {
          question: "What brands do you carry?",
          answer:
            "Perkins, Cummins, FG Wilson, John Deere and other leading manufacturers.",
          sortOrder: 1,
        },
        {
          question: "Can I rent a generator short-term?",
          answer:
            "Absolutely. We offer flexible short and long-term rentals with transport and installation.",
          sortOrder: 2,
        },
        {
          question: "Do generators come with a warranty?",
          answer:
            "All new units include a manufacturer warranty; terms vary by model.",
          sortOrder: 3,
        },
        {
          question: "Do you provide after-sales service?",
          answer:
            "Yes — scheduled maintenance, repairs, overhauling, and genuine spare parts.",
          sortOrder: 4,
        },
        {
          question: "How do I get a quote?",
          answer:
            "Use the Request a Quote form or message us on WhatsApp with your power requirements.",
          sortOrder: 5,
        },
      ],
    });
    console.log("  ✓ FAQs");
  }

  const blogCat = await prisma.blogCategory.upsert({
    where: { slug: "guides" },
    update: {},
    create: { name: "Guides", slug: "guides" },
  });
  if ((await prisma.blog.count()) === 0) {
    await prisma.blog.createMany({
      data: [
        {
          title: "How to size a generator for your business",
          slug: "how-to-size-a-generator",
          excerpt:
            "A practical guide to calculating the right KVA for your load.",
          content:
            "Choosing the right generator starts with understanding your total connected load and which circuits are critical. Add up the running watts of essential equipment, account for motor starting surges, and add headroom for growth. Our power consultants can perform a full load assessment and recommend the ideal set.\n\nUndersizing leads to overload and downtime; oversizing wastes fuel and capital. The sweet spot balances peak demand, efficiency, and future expansion.",
          coverImage: "https://picsum.photos/seed/tt-blog-1/1200/700",
          categoryId: blogCat.id,
          published: true,
          publishedAt: new Date(),
        },
        {
          title: "Diesel vs petrol generators: which is right for you?",
          slug: "diesel-vs-petrol-generators",
          excerpt:
            "Compare fuel efficiency, runtime, noise, and total cost of ownership.",
          content:
            "Diesel generators are the workhorses of industrial power — efficient, durable, and ideal for continuous or standby duty at higher capacities. Petrol generators are lighter and lower cost, well suited to portable and lower-power needs.\n\nConsider runtime, fuel availability, maintenance, and noise. For most commercial and industrial sites, diesel offers the best total cost of ownership.",
          coverImage: "https://picsum.photos/seed/tt-blog-2/1200/700",
          categoryId: blogCat.id,
          published: true,
          publishedAt: new Date(),
        },
      ],
    });
    console.log("  ✓ blog posts");
  }

  console.log("Seeding complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
