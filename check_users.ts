import { db } from "./src/db";
import { users } from "./src/db/schema";

async function check() {
  const allUsers = await db.select().from(users);
  console.log(allUsers.map(u => ({ email: u.email, role: u.role, passwordHash: u.passwordHash })));
  process.exit(0);
}
check();
