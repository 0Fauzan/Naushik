import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./middleware";

export const getInventory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { inventory } = await import("../db/schema");
    return await db.select().from(inventory);
  });

export const createInventoryItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { inventory } = await import("../db/schema");
    const [item] = await db.insert(inventory).values({
      itemId: `INV-${Math.floor(Math.random() * 10000)}`,
      ...data,
      status: data.qty <= data.minStock ? "critical" : "good",
    }).returning();
    return item;
  });

export const updateInventoryItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { inventory } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [item] = await db.update(inventory).set({
      ...data,
      status: data.qty <= data.minStock ? "critical" : "good",
    }).where(eq(inventory.id, data.id)).returning();
    return item;
  });

export const deleteInventoryItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: number) => data)
  .handler(async ({ data: id }) => {
    const { db } = await import("../db");
    const { inventory } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(inventory).where(eq(inventory.id, id));
  });

export const transferInventory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { sourceId: number, targetProject: string, qty: number }) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { inventory } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    
    // Fetch source item
    const [sourceItem] = await db.select().from(inventory).where(eq(inventory.id, data.sourceId));
    if (!sourceItem || sourceItem.qty < data.qty) throw new Error("Invalid transfer amount");

    // Deduct from source
    await db.update(inventory).set({
      qty: sourceItem.qty - data.qty,
      status: (sourceItem.qty - data.qty) <= (sourceItem.minStock || 0) ? "critical" : "good",
    }).where(eq(inventory.id, data.sourceId));

    // For simplicity, just create a new record in target project
    const [newItem] = await db.insert(inventory).values({
      itemId: `INV-${Math.floor(Math.random() * 10000)}`,
      item: sourceItem.item,
      category: sourceItem.category,
      project: data.targetProject,
      qty: data.qty,
      unit: sourceItem.unit,
      value: sourceItem.value,
      minStock: sourceItem.minStock,
      status: data.qty <= (sourceItem.minStock || 0) ? "critical" : "good",
    }).returning();
    
    return newItem;
  });
