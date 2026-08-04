import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./middleware";

export const getSiteManagers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { siteManagers } = await import("../db/schema");
    return await db.select().from(siteManagers);
  });

export const createSiteManager = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: { name: string, project: string, experience: number } }) => {
    const { db } = await import("../db");
    const { siteManagers } = await import("../db/schema");
    const [manager] = await db.insert(siteManagers).values({
      managerId: `SM-${Math.floor(Math.random() * 10000)}`,
      name: data.name,
      project: data.project,
      experience: data.experience,
      rating: "4.5",
    }).returning();
    return manager;
  });

export const updateSiteManager = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: { id: number, name: string, project: string, experience: number } }) => {
    const { db } = await import("../db");
    const { siteManagers } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [manager] = await db.update(siteManagers).set({
      name: data.name,
      project: data.project,
      experience: data.experience,
    }).where(eq(siteManagers.id, data.id)).returning();
    return manager;
  });

export const deleteSiteManager = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data: id }: { data: number }) => {
    const { db } = await import("../db");
    const { siteManagers } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(siteManagers).where(eq(siteManagers.id, id));
  });
