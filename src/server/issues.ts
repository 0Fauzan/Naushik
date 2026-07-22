import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { issues } from "../db/schema";
import { authMiddleware } from "./middleware";

export const getIssues = createServerFn("GET", async (_, ctx) => {
  return await db.select().from(issues);
}).middleware([authMiddleware]);

export const getIssue = createServerFn("GET", async (id: number, ctx) => {
  const [issue] = await db.select().from(issues).where(eq(issues.id, id));
  return issue;
}).middleware([authMiddleware]);
