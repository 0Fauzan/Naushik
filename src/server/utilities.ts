import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getUtilities = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
  const { db } = await import("../db");
  const { utilities } = await import("../db/schema");
  return await db.select().from(utilities);
});

export const createUtility = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string; type?: string; siteId?: number; inUse?: boolean }) => data)
  .handler(async ({ data }) => {
  const { db } = await import("../db");
  const { utilities } = await import("../db/schema");
  const [newUtility] = await db.insert(utilities).values(data).returning();
  return newUtility;
});

export const updateUtility = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; name?: string; type?: string; siteId?: number; inUse?: boolean }) => data)
  .handler(async ({ data }) => {
  const { db } = await import("../db");
  const { utilities } = await import("../db/schema");
  const { id, ...updateData } = data;
  const [updatedUtility] = await db.update(utilities).set(updateData).where(eq(utilities.id, id)).returning();
  return updatedUtility;
});

export const deleteUtility = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: number) => data)
  .handler(async ({ data: id }) => {
  const { db } = await import("../db");
  const { utilities } = await import("../db/schema");
  await db.delete(utilities).where(eq(utilities.id, id));
  return { success: true };
});
