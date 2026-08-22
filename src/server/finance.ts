import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./middleware";

export const getStatements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { statements } = await import("../db/schema");
    return await db.select().from(statements);
  });

export const createStatement = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { type: string, period: string }) => data)
  .handler(async ({ data }: { data: { type: string, period: string } }) => {
    const { db } = await import("../db");
    const { statements } = await import("../db/schema");
    const [statement] = await db.insert(statements).values({
      type: data.type,
      period: data.period,
      status: "generated",
    }).returning();
    return statement;
  });
