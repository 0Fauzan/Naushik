import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { hashPassword } from "../lib/auth-crypto";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables.");
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Starting seed process...");
  try {
    // 1. Seed Admin User
    console.log("Seeding admin user...");
    const adminPassword = await hashPassword("admin123");
    await db.insert(schema.users).values({
      email: "admin@naushik.co",
      passwordHash: adminPassword,
      role: "admin",
    }).onConflictDoNothing();

    const managerPassword = await hashPassword("manager123");
    await db.insert(schema.users).values({
      email: "manager@naushik.co",
      passwordHash: managerPassword,
      role: "user",
    }).onConflictDoNothing();

    // 2. Seed Projects (No mock data)
    console.log("Skipping mock projects...");

    console.log("✅ Seed completed successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    process.exit(0);
  }
}

seed();
