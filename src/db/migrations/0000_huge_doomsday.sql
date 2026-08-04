CREATE TABLE "dprs" (
	"id" serial PRIMARY KEY NOT NULL,
	"dpr_id" varchar(50) NOT NULL,
	"date" varchar(50) NOT NULL,
	"project" varchar(255),
	"workers" integer NOT NULL,
	"work_completed" text,
	"delays" text,
	"remarks" text,
	"progress" integer NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	CONSTRAINT "dprs_dpr_id_unique" UNIQUE("dpr_id")
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"project" varchar(255),
	"status" varchar(50) DEFAULT 'operational' NOT NULL,
	"utilisation" integer DEFAULT 0,
	"next_service" timestamp,
	CONSTRAINT "equipment_equipment_id_unique" UNIQUE("equipment_id")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" varchar(50) NOT NULL,
	"item" varchar(255) NOT NULL,
	"category" varchar(100),
	"project" varchar(255),
	"qty" integer NOT NULL,
	"unit" varchar(50),
	"value" integer DEFAULT 0,
	"min_stock" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'good' NOT NULL,
	CONSTRAINT "inventory_item_id_unique" UNIQUE("item_id")
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue_id" varchar(50) NOT NULL,
	"project" varchar(255),
	"type" varchar(50),
	"title" varchar(255) NOT NULL,
	"priority" varchar(50) DEFAULT 'medium' NOT NULL,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"raised_by" varchar(100),
	"date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "issues_issue_id_unique" UNIQUE("issue_id")
);
--> statement-breakpoint
CREATE TABLE "material_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" varchar(50) NOT NULL,
	"project" varchar(255),
	"item" varchar(255) NOT NULL,
	"qty" integer NOT NULL,
	"unit" varchar(50),
	"amount" integer DEFAULT 0,
	"requested_by" varchar(100),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"priority" varchar(50) DEFAULT 'medium' NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "material_requests_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"author" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"client" varchar(255),
	"location" text,
	"manager" varchar(100),
	"start_date" timestamp,
	"end_date" timestamp,
	"budget" integer,
	"spent" integer,
	"progress" integer,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	CONSTRAINT "projects_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "site_managers" (
	"id" serial PRIMARY KEY NOT NULL,
	"manager_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"project" varchar(255),
	"experience" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"rating" text,
	CONSTRAINT "site_managers_manager_id_unique" UNIQUE("manager_id")
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"pin_hash" varchar(255),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "utilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100),
	"site_id" serial NOT NULL,
	"in_use" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" serial PRIMARY KEY NOT NULL,
	"worker_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"trade" varchar(100),
	"status" varchar(50) DEFAULT 'present' NOT NULL,
	"hours" integer DEFAULT 0,
	CONSTRAINT "workers_worker_id_unique" UNIQUE("worker_id")
);
--> statement-breakpoint
ALTER TABLE "utilities" ADD CONSTRAINT "utilities_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;