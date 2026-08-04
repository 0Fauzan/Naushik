import { createServerFn } from "@tanstack/react-start";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getDocuments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { documents } = await import("../db/schema");
    return await db.select().from(documents).orderBy(desc(documents.uploadedAt));
  });

export const createDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: any }) => {
    const { db } = await import("../db");
    const { documents } = await import("../db/schema");
    const [doc] = await db.insert(documents).values({
      documentId: `DOC-${Math.floor(Math.random() * 10000)}`,
      ...data,
      uploadedAt: new Date(),
    }).returning();
    return doc;
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data: id }: { data: number }) => {
    const { db } = await import("../db");
    const { documents } = await import("../db/schema");
    await db.delete(documents).where(eq(documents.id, id));
  });
