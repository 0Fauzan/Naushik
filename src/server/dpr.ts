import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./middleware";

export const getDprs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { dprs } = await import("../db/schema");
    return await db.select().from(dprs);
  });

export const createDpr = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { dprs } = await import("../db/schema");
    const [dpr] = await db.insert(dprs).values({
      dprId: `DPR-${Math.floor(Math.random() * 10000)}`,
      ...data,
      date: new Date().toISOString().split("T")[0],
    }).returning();
    return dpr;
  });

export const updateDpr = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { dprs } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [dpr] = await db.update(dprs).set({
      ...data,
    }).where(eq(dprs.id, data.id)).returning();
    return dpr;
  });

export const deleteDpr = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: number) => data)
  .handler(async ({ data: id }) => {
    const { db } = await import("../db");
    const { dprs } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(dprs).where(eq(dprs.id, id));
  });
