import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Prisma 7 uses the query compiler + a driver adapter (node-postgres here).
 * A single client instance is reused across hot reloads in development to
 * avoid exhausting database connections.
 */
const createPrismaClient = () => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
