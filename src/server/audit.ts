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
  .validator((data: { action: string, entity: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import("../db");
    const { auditLogs } = await import("../db/schema");
    const { userId } = context as any;
    
    // Fetch user name from db using userId from context
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [u] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    const user = u?.name || "System";

    const [log] = await db.insert(auditLogs).values({
      user,
      action: data.action,
      entity: data.entity,
      date: new Date(),
    }).returning();
    return log;
  });
