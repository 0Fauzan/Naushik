import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";
import { authMiddleware } from "./middleware";

export const getProjects = createServerFn("GET", async (_, ctx) => {
  return await db.select().from(projects);
}).middleware([authMiddleware]);

export const getProject = createServerFn("GET", async (id: number, ctx) => {
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  return project;
}).middleware([authMiddleware]);
