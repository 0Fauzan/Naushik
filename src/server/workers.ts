import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getWorkers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
  const { db } = await import("../db");
  const { workers } = await import("../db/schema");
  return await db.select().from(workers);
});

export const getWorker = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: number) => data)
  .handler(async ({ data: id }) => {
  const { db } = await import("../db");
  const { workers } = await import("../db/schema");
  const [worker] = await db.select().from(workers).where(eq(workers.id, id));
  return worker;
});
