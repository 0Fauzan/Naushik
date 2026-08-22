import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getSites = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
  const { db } = await import("../db");
  const { sites } = await import("../db/schema");
  return await db.select().from(sites);
});

export const createSite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string; location?: string }) => data)
  .handler(async ({ data }) => {
  const { db } = await import("../db");
  const { sites } = await import("../db/schema");
  const [newSite] = await db.insert(sites).values(data).returning();
  return newSite;
});

export const updateSite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number; name?: string; location?: string; status?: string }) => data)
  .handler(async ({ data }) => {
  const { db } = await import("../db");
  const { sites } = await import("../db/schema");
  const { id, ...updateData } = data;
  const [updatedSite] = await db.update(sites).set(updateData).where(eq(sites.id, id)).returning();
  return updatedSite;
});

export const deleteSite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: number) => data)
  .handler(async ({ data: id }) => {
  const { db } = await import("../db");
  const { sites } = await import("../db/schema");
  await db.delete(sites).where(eq(sites.id, id));
  return { success: true };
});
