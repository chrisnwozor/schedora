import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  logger.error(
    "database.configuration_missing",
    new Error("DATABASE_URL is not configured."),
  );

  throw new Error("DATABASE_URL is not configured.");
}

function createPrismaClient() {
  logger.info("database.client_initializing", {
    adapter: "postgresql",
    environment: process.env.NODE_ENV,
  });

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  return new PrismaClient({
    adapter,
    errorFormat: process.env.NODE_ENV === "development" ? "pretty" : "minimal",
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
