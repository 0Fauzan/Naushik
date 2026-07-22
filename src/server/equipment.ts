import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { equipment } from "../db/schema";
import { authMiddleware } from "./middleware";

export const getEquipment = createServerFn("GET", async (_, ctx) => {
  return await db.select().from(equipment);
}).middleware([authMiddleware]);

export const getEquipmentById = createServerFn("GET", async (id: number, ctx) => {
  const [eqItem] = await db.select().from(equipment).where(eq(equipment.id, id));
  return eqItem;
}).middleware([authMiddleware]);
