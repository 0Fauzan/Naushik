import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./middleware";
import { eq, desc } from "drizzle-orm";

export const getMaterialRequests = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { materialRequests } = await import("../db/schema");
    return await db.select().from(materialRequests).orderBy(desc(materialRequests.date));
  });

export const createMaterialRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { materialRequests } = await import("../db/schema");
    const [req] = await db.insert(materialRequests).values({
      requestId: `PO-${Math.floor(Math.random() * 10000)}`,
      ...data,
      date: new Date(),
    }).returning();
    return req;
  });

export const updateMaterialRequestStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: number, status: string }) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { materialRequests } = await import("../db/schema");
    await db.update(materialRequests).set({ status: data.status }).where(eq(materialRequests.id, data.id));
  });

export const deleteMaterialRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: number) => data)
  .handler(async ({ data: id }) => {
    const { db } = await import("../db");
    const { materialRequests } = await import("../db/schema");
    await db.delete(materialRequests).where(eq(materialRequests.id, id));
  });
