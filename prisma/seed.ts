import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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

  // Demo products (one per primary fuel category) so the catalog isn't empty.
  const diesel = await prisma.category.findUniqueOrThrow({
    where: { slug: "diesel-generators" },
  });
  const perkins = await prisma.brand.findUniqueOrThrow({
    where: { slug: "perkins" },
  });
  const cummins = await prisma.brand.findUniqueOrThrow({
    where: { slug: "cummins" },
  });

  const demoProducts = [
    {
      name: "Perkins 20 KVA Diesel Generator",
      slug: "perkins-20-kva-diesel-generator",
      sku: "TT-DSL-PRK-020",
      price: "950000",
      kva: 20,
      engineModel: "Perkins 404D-22G",
      brandId: perkins.id,
    },
    {
      name: "Cummins 100 KVA Diesel Generator",
      slug: "cummins-100-kva-diesel-generator",
      sku: "TT-DSL-CMN-100",
      price: "3850000",
      kva: 100,
      engineModel: "Cummins 6BTAA5.9-G2",
      brandId: cummins.id,
    },
  ];

  for (const p of demoProducts) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        kva: p.kva,
        engineModel: p.engineModel,
        fuelType: "DIESEL",
        generatorType: "DIESEL",
        frequency: "50Hz",
        voltage: "400V",
        phase: "3-Phase",
        warranty: "1 Year",
        featured: true,
        published: true,
        categoryId: diesel.id,
        brandId: p.brandId,
        inventory: {
          create: { quantity: 5, available: 5, reorderLevel: 2 },
        },
        specifications: {
          create: [
            { title: "Engine", value: p.engineModel },
            { title: "Frequency", value: "50Hz" },
            { title: "Voltage", value: "400V" },
          ],
        },
      },
    });
  }
  console.log(`  ✓ ${demoProducts.length} demo products`);

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
