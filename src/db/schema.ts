import { pgTable, serial, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  pinHash: varchar("pin_hash", { length: 255 }), // Optional PIN login
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: text("location"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const utilities = pgTable("utilities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // e.g., 'equipment', 'vehicle'
  siteId: serial("site_id").references(() => sites.id),
  inUse: boolean("in_use").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: varchar("project_id", { length: 50 }).notNull().unique(), // e.g. PRJ-101
  name: varchar("name", { length: 255 }).notNull(),
  client: varchar("client", { length: 255 }),
  location: text("location"),
  manager: varchar("manager", { length: 100 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: integer("budget"),
  spent: integer("spent"),
  progress: integer("progress"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
});

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  workerId: varchar("worker_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  trade: varchar("trade", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("present"),
  hours: integer("hours").default(0),
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  equipmentId: varchar("equipment_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  project: varchar("project", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("operational"),
  utilisation: integer("utilisation").default(0),
  nextService: timestamp("next_service"),
});

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  issueId: varchar("issue_id", { length: 50 }).notNull().unique(),
  project: varchar("project", { length: 255 }),
  type: varchar("type", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull().default("medium"),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  raisedBy: varchar("raised_by", { length: 100 }),
  date: timestamp("date").defaultNow().notNull(),
});
