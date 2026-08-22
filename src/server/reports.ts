import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./middleware";

export const getReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { reports } = await import("../db/schema");
    return await db.select().from(reports);
  });

export const createReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { title: string, source: string, frequency: string }) => data)
  .handler(async ({ data }: { data: { title: string, source: string, frequency: string } }) => {
    const { db } = await import("../db");
    const { reports } = await import("../db/schema");
    const [report] = await db.insert(reports).values({
      title: data.title,
      source: data.source,
      frequency: data.frequency,
      status: "scheduled",
    }).returning();
    return report;
  });
