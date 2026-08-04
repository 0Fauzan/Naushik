import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getProjects = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { projects } = await import("../db/schema");
    return await db.select().from(projects);
  });

export const getProject = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ data: id }: { data: number }) => {
    const { db } = await import("../db");
    const { projects } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  });

export const getProjectDetails = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ data: id }: { data: number }) => {
    const { db } = await import("../db");
    const { projects, materialRequests, inventory, issues } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) throw new Error("Project not found");

    const requests = await db.select().from(materialRequests).where(eq(materialRequests.project, project.name));
    const inventoryItems = await db.select().from(inventory).where(eq(inventory.project, project.name));
    const projectIssues = await db.select().from(issues).where(eq(issues.project, project.name));

    return { project, requests, inventoryItems, projectIssues };
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: any }) => {
    const { db } = await import("../db");
    const { projects } = await import("../db/schema");
    const [project] = await db.insert(projects).values({
      projectId: `PRJ-${Math.floor(Math.random() * 10000)}`,
      name: data.name,
      client: data.client,
      location: data.location,
      manager: data.manager,
      budget: data.budget,
      status: "active",
      progress: 0,
      spent: 0,
      startDate: new Date(),
    }).returning();
    return project;
  });

export const updateProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: { id: number, name: string, client: string, location: string, manager: string, budget: number } }) => {
    const { db } = await import("../db");
    const { projects } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [project] = await db.update(projects).set({
      name: data.name,
      client: data.client,
      location: data.location,
      manager: data.manager,
      budget: data.budget,
    }).where(eq(projects.id, data.id)).returning();
    return project;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data: id }: { data: number }) => {
    const { db } = await import("../db");
    const { projects } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(projects).where(eq(projects.id, id));
  });
