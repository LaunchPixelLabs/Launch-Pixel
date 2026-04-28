CREATE TABLE "knowledge_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer,
	"content" text NOT NULL,
	"embedding" text,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_source_id_knowledge_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_contacts" ADD CONSTRAINT "agent_contacts_phone_number_user_id_unique" UNIQUE("phone_number","user_id");