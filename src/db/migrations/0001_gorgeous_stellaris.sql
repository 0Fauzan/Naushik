CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" varchar(255) NOT NULL,
	"action" varchar(255) NOT NULL,
	"entity" varchar(255) NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100),
	"project" varchar(255),
	"size" varchar(50),
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documents_document_id_unique" UNIQUE("document_id")
);
