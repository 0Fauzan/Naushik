import { pgTable, serial, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  pinHash: varchar("pin_hash", { length: 255 }), // Optional PIN login
  role: varchar("role", { length: 50 }).notNull().default("user"),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }),
  whatsappNotifications: boolean("whatsapp_notifications").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  theme: varchar("theme", { length: 50 }).notNull().default("system"),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteManagers = pgTable("site_managers", {
  id: serial("id").primaryKey(),
  managerId: varchar("manager_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  project: varchar("project", { length: 255 }),
  experience: integer("experience").default(0),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  rating: text("rating"), // store as text or numeric
});

export const materialRequests = pgTable("material_requests", {
  id: serial("id").primaryKey(),
  requestId: varchar("request_id", { length: 50 }).notNull().unique(),
  project: varchar("project", { length: 255 }),
  item: varchar("item", { length: 255 }).notNull(),
  qty: integer("qty").notNull(),
  unit: varchar("unit", { length: 50 }),
  amount: integer("amount").default(0),
  requestedBy: varchar("requested_by", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  priority: varchar("priority", { length: 50 }).notNull().default("medium"),
  date: timestamp("date").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemId: varchar("item_id", { length: 50 }).notNull().unique(),
  item: varchar("item", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  project: varchar("project", { length: 255 }),
  qty: integer("qty").notNull(),
  unit: varchar("unit", { length: 50 }),
  value: integer("value").default(0),
  minStock: integer("min_stock").default(0),
  status: varchar("status", { length: 50 }).notNull().default("good"),
});

export const dprs = pgTable("dprs", {
  id: serial("id").primaryKey(),
  dprId: varchar("dpr_id", { length: 50 }).notNull().unique(),
  date: varchar("date", { length: 50 }).notNull(),
  project: varchar("project", { length: 255 }),
  workers: integer("workers").notNull(),
  workCompleted: text("work_completed"),
  delays: text("delays"),
  remarks: text("remarks"),
  progress: integer("progress").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  documentId: varchar("document_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // Drawing, BOQ, Contract, Inspection, Approval
  project: varchar("project", { length: 255 }),
  size: varchar("size", { length: 50 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  user: varchar("user", { length: 255 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entity: varchar("entity", { length: 255 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  attendees: text("attendees"), // JSON array or comma separated
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  source: varchar("source", { length: 100 }),
  frequency: varchar("frequency", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
});

export const statements = pgTable("statements", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  period: varchar("period", { length: 50 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("generated"),
  date: timestamp("date").defaultNow().notNull(),
});
