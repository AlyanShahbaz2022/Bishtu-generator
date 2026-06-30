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
