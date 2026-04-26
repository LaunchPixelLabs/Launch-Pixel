CREATE TABLE "certificate_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_name" varchar(255) NOT NULL,
	"program_name" varchar(255) NOT NULL,
	"certificate_type" varchar(100) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"total_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"error_log" text,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certificate_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"description" text,
	"template_html" text,
	"template_css" text,
	"background_image" text,
	"default_issuer" varchar(255),
	"default_issuer_title" varchar(255),
	"default_signature" text,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certificate_verification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"certificate_id" integer,
	"verification_id" varchar(64) NOT NULL,
	"verified_at" timestamp DEFAULT now(),
	"ip_address" varchar(45),
	"user_agent" text,
	"location" varchar(255),
	"status" varchar(50) NOT NULL,
	"verified_by" varchar(255),
	"purpose" varchar(100),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"verification_id" varchar(64) NOT NULL,
	"candidate_id" integer,
	"candidate_name" varchar(255) NOT NULL,
	"candidate_email" varchar(255),
	"candidate_phone" varchar(50),
	"certificate_type" varchar(100) NOT NULL,
	"program_name" varchar(255) NOT NULL,
	"program_duration" varchar(100),
	"issue_date" timestamp NOT NULL,
	"expiry_date" timestamp,
	"grade" varchar(50),
	"skills_acquired" text,
	"projects_completed" text,
	"performance_notes" text,
	"issued_by" varchar(255) DEFAULT 'Launch Pixel' NOT NULL,
	"issuer_title" varchar(255),
	"issuer_signature" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"verification_count" integer DEFAULT 0,
	"last_verified_at" timestamp,
	"qr_code_url" text,
	"public_verification_url" text,
	"metadata" text,
	"notes" text,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"revoked_at" timestamp,
	"revoked_by" varchar(255),
	"revoked_reason" text,
	CONSTRAINT "certificates_verification_id_unique" UNIQUE("verification_id")
);
--> statement-breakpoint
ALTER TABLE "certificate_verification_logs" ADD CONSTRAINT "certificate_verification_logs_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_candidate_id_agent_contacts_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."agent_contacts"("id") ON DELETE set null ON UPDATE no action;