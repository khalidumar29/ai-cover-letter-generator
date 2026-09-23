import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../lib/generated/prisma/client";

/**
 * Seeds the credit packages from the project plan. Upserted by slug, so
 * re-running is safe and never resets a price an admin has since edited
 * beyond what is defined here.
 */
const packages = [
  {
    slug: "basic",
    name: "Basic",
    credits: 10,
    priceCents: 500,
    description: "Enough for a handful of applications.",
    sortOrder: 1,
  },
  {
    slug: "standard",
    name: "Standard",
    credits: 25,
    priceCents: 1000,
    description: "For an active job search.",
    sortOrder: 2,
  },
  {
    slug: "pro",
    name: "Pro",
    credits: 60,
    priceCents: 2000,
    description: "For applying at volume across several roles.",
    sortOrder: 3,
  },
];

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  for (const entry of packages) {
    await prisma.creditPackage.upsert({
      where: { slug: entry.slug },
      update: { name: entry.name, description: entry.description, sortOrder: entry.sortOrder },
      create: entry,
    });
  }

  console.log(`Seeded ${packages.length} credit packages.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
