import { db } from "./src/db";
import { projects } from "./src/db/schema";

async function run() {
  try {
    const res = await db.select().from(projects);
    console.log("Success! Found", res.length, "projects.");
  } catch (err: any) {
    console.error("DB Error:", err);
  }
  process.exit(0);
}
run();
