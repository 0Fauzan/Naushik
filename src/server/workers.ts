import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { workers } from "../db/schema";
import { authMiddleware } from "./middleware";

export const getWorkers = createServerFn("GET", async (_, ctx) => {
  return await db.select().from(workers);
}).middleware([authMiddleware]);

export const getWorker = createServerFn("GET", async (id: number, ctx) => {
  const [worker] = await db.select().from(workers).where(eq(workers.id, id));
  return worker;
}).middleware([authMiddleware]);
