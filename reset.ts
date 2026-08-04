import { db } from "./src/db";
import { users } from "./src/db/schema";
import { hashPassword } from "./src/lib/auth-crypto";
import { eq } from "drizzle-orm";

async function reset() {
  const hash = await hashPassword("admin123");
  await db.update(users).set({ passwordHash: hash }).where(eq(users.email, "admin@naushik.co"));
  console.log("Password reset successfully");
  process.exit(0);
}
reset();
