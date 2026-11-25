/**
 * @file prisma-client.ts
 * @package apps/api
 * @purpose Initializes and caches a single PrismaClient instance to prevent PostgreSQL connection pool depletion.
 *          Also resolves Supabase pooler hostnames to IPv4 at startup to avoid Windows DNS64/NAT64 (64:ff9b::)
 *          IPv6 connection timeouts in Prisma's Rust query engine, and caps connection_limit safely for Supabase free tier.
 * @dependencies @prisma/client, @verisphere/shared-config
 * @security Ensure DB credentials are not logged.
 */

import { PrismaClient } from "@prisma/client";
import { execFileSync } from "child_process";

declare global {
  var prisma: PrismaClient | undefined;
}

function buildResilientDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname;

    // Resolve IPv4 synchronously for Supabase pooler hosts to bypass NAT64/IPv6 hangs in Prisma Rust engine
    if (host.includes("supabase.com") && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      try {
        const ipv4 = execFileSync(
          process.execPath,
          [
            "-e",
            `require('dns').promises.resolve4(${JSON.stringify(host)}).then(a => process.stdout.write(a[0] || '')).catch(() => {})`,
          ],
          { timeout: 3000, encoding: "utf8" }
        ).trim();

        if (ipv4 && /^\d+\.\d+\.\d+\.\d+$/.test(ipv4)) {
          parsed.hostname = ipv4;
          console.log(`[Prisma] Resolved ${host} → IPv4 ${ipv4} (bypassing IPv6/NAT64 timeout).`);
        }
      } catch {
        // Fall back to original hostname if IPv4 lookup fails
      }
    }

    // Enforce safe pool limits for Supabase free tier (~15 session pooler max)
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", "5");
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "20");
    }
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "15");
    }
    if (parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }

    return parsed.toString();
  } catch {
    return raw;
  }
}

const resolvedDbUrl = buildResilientDatabaseUrl();

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    ...(resolvedDbUrl ? { datasources: { db: { url: resolvedDbUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
