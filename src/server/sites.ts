import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sites } from "../db/schema";
import { authMiddleware } from "./middleware";

export const getSites = createServerFn("GET", async (_, ctx) => {
  return await db.select().from(sites);
}).middleware([authMiddleware]);

export const createSite = createServerFn("POST", async (data: { name: string; location?: string }, ctx) => {
  const [newSite] = await db.insert(sites).values(data).returning();
  return newSite;
}).middleware([authMiddleware]);

export const updateSite = createServerFn("POST", async (data: { id: number; name?: string; location?: string; status?: string }, ctx) => {
  const { id, ...updateData } = data;
  const [updatedSite] = await db.update(sites).set(updateData).where(eq(sites.id, id)).returning();
  return updatedSite;
}).middleware([authMiddleware]);

export const deleteSite = createServerFn("POST", async (id: number, ctx) => {
  await db.delete(sites).where(eq(sites.id, id));
  return { success: true };
}).middleware([authMiddleware]);
