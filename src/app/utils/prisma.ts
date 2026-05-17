// src/app/utils/prisma.ts
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.config"; 
import { PrismaPg } from "@prisma/adapter-pg";

// ─── Prisma Singleton (prevents multiple connections in dev hot reload) ─────────
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev
      ? [
          { emit: "event", level: "query" },
          { emit: "event", level: "error" },
          { emit: "event", level: "warn" },
        ]
      : [{ emit: "event", level: "error" }], adapter
  });

// if (env.isDev) {
//   (prisma as PrismaClient & {
//     $on: (event: string, cb: (e: { query: string; duration: number }) => void) => void;
//   }).$on("query", (e) => {
     
//   });
// }

// prisma.$on("error" as never, (e: unknown) => {
   
// });

if (!env.isProd) globalForPrisma.prisma = prisma;

// ─── Health Check ─────────────────────────────────────────────────────────────
export async function checkDatabaseConnection(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
