import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { utilities } from "../db/schema";
import { authMiddleware } from "./middleware";

export const getUtilities = createServerFn("GET", async (_, ctx) => {
  return await db.select().from(utilities);
}).middleware([authMiddleware]);

export const createUtility = createServerFn("POST", async (data: { name: string; type?: string; siteId?: number; inUse?: boolean }, ctx) => {
  const [newUtility] = await db.insert(utilities).values(data).returning();
  return newUtility;
}).middleware([authMiddleware]);

export const updateUtility = createServerFn("POST", async (data: { id: number; name?: string; type?: string; siteId?: number; inUse?: boolean }, ctx) => {
  const { id, ...updateData } = data;
  const [updatedUtility] = await db.update(utilities).set(updateData).where(eq(utilities.id, id)).returning();
  return updatedUtility;
}).middleware([authMiddleware]);

export const deleteUtility = createServerFn("POST", async (id: number, ctx) => {
  await db.delete(utilities).where(eq(utilities.id, id));
  return { success: true };
}).middleware([authMiddleware]);
