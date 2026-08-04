import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { authMiddleware } from "./middleware";

export const getNotes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { db } = await import("../db");
    const { notes } = await import("../db/schema");
    return await db.select().from(notes).orderBy(desc(notes.createdAt));
  });

export const createNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: { content: string, author: string } }) => {
    const { db } = await import("../db");
    const { notes } = await import("../db/schema");
    const [note] = await db.insert(notes).values({
      content: data.content,
      author: data.author,
    }).returning();
    return note;
  });

export const updateNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data }: { data: { id: number, content: string } }) => {
    const { db } = await import("../db");
    const { notes } = await import("../db/schema");
    const [note] = await db.update(notes).set({ content: data.content }).where(eq(notes.id, data.id)).returning();
    return note;
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ data: id }: { data: number }) => {
    const { db } = await import("../db");
    const { notes } = await import("../db/schema");
    await db.delete(notes).where(eq(notes.id, id));
  });
