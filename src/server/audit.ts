import { createServerFn } from "@tanstack/react-start";
import { desc } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { auditLogs } = await import("../db/schema");
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.date));
  });

export const createAuditLog = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: { action: string, entity: string } }) => {
    const { db } = await import("../db");
    const { auditLogs } = await import("../db/schema");
    const { getAuthSession } = await import("./auth");
    
    // We get the user from auth session
    const session = await getAuthSession();
    const user = session?.name || "System";

    const [log] = await db.insert(auditLogs).values({
      user,
      action: data.action,
      entity: data.entity,
      date: new Date(),
    }).returning();
    return log;
  });
