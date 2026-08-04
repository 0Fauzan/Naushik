import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getEquipment = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
  const { db } = await import("../db");
  const { equipment } = await import("../db/schema");
  return await db.select().from(equipment);
});

export const getEquipmentById = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ data: id }: { data: number }) => {
  const { db } = await import("../db");
  const { equipment } = await import("../db/schema");
  const [eqItem] = await db.select().from(equipment).where(eq(equipment.id, id));
  return eqItem;
});

export const updateEquipmentStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: { id: number, status: string } }) => {
    const { db } = await import("../db");
    const { equipment } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(equipment).set({ status: data.status }).where(eq(equipment.id, data.id));
  });

export const updateEquipment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: any }) => {
    const { db } = await import("../db");
    const { equipment } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [eqItem] = await db.update(equipment).set({
      ...data,
    }).where(eq(equipment.id, data.id)).returning();
    return eqItem;
  });

export const deleteEquipment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data: id }: { data: number }) => {
    const { db } = await import("../db");
    const { equipment } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(equipment).where(eq(equipment.id, id));
  });
