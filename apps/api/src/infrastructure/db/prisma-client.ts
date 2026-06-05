/**
 * @file prisma-client.ts
 * @package apps/api
 * @purpose Initializes and caches a single PrismaClient instance to prevent PostgreSQL connection pool depletion.
 * @dependencies @prisma/client, @verisphere/shared-config
 * @security Ensure DB credentials are not logged. Log SQL statement durations in development environment only.
 * @future_implementation Include Prisma middleware for auto-hashing API keys or encrypting candidate emails at rest.
 */

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
