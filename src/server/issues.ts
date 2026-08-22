import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getIssues = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
  const { db } = await import("../db");
  const { issues } = await import("../db/schema");
  return await db.select().from(issues);
});

export const getIssue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: number) => data)
  .handler(async ({ data: id }) => {
  const { db } = await import("../db");
  const { issues } = await import("../db/schema");
  const [issue] = await db.select().from(issues).where(eq(issues.id, id));
  return issue;
});

export const createIssue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { issues } = await import("../db/schema");
    const [issue] = await db.insert(issues).values({
      issueId: `ISSUE-${Math.floor(Math.random() * 10000)}`,
      ...data,
      date: new Date(),
    }).returning();

    // WhatsApp Integration Trigger
    if (issue.priority === "critical") {
      const { users } = await import("../db/schema");
      const { notifyManagerOnCriticalIssue } = await import("./whatsapp");
      // Find an admin with notifications enabled
      const [admin] = await db.select().from(users).where(eq(users.role, "admin"));
      if (admin && admin.whatsappNotifications && admin.whatsappNumber) {
        // Run asynchronously without awaiting so we don't block the API response
        notifyManagerOnCriticalIssue(admin.whatsappNumber, issue.title, issue.project || "Unknown Project")
          .catch(console.error);
      }
    }

    return issue;
  });

export const updateIssue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: any) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db");
    const { issues } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const [issue] = await db.update(issues).set({
      ...data,
    }).where(eq(issues.id, data.id)).returning();
    return issue;
  });

export const deleteIssue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: number) => data)
  .handler(async ({ data: id }) => {
    const { db } = await import("../db");
    const { issues } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(issues).where(eq(issues.id, id));
  });
