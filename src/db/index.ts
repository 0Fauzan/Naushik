import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import "dotenv/config";

// HARDCODED to bypass Vercel dashboard Environment Variable overrides which were causing connection failures
const connectionString = "postgresql://postgres.jzdnkdhrqcajnplulnma:Naushik%40123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables.");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const client = globalForDb.conn ?? postgres(connectionString, { 
  prepare: false, 
  max: 10,
  ssl: 'require'
});
if (process.env.NODE_ENV !== "production") globalForDb.conn = client;

export const db = /* @__PURE__ */ drizzle(client, { schema });
