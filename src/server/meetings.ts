import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getMeetings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { meetings } = await import("../db/schema");
    return await db.select().from(meetings);
  });

export const updateMeetingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: { id: number, status: string } }) => {
    const { db } = await import("../db");
    const { meetings } = await import("../db/schema");
    const [meeting] = await db.update(meetings)
      .set({ status: data.status })
      .where(eq(meetings.id, data.id))
      .returning();
    return meeting;
  });
