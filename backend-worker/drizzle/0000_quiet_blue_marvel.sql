CREATE TABLE "agent_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"agent_type" varchar(50) NOT NULL,
	"role" varchar(50) DEFAULT 'custom' NOT NULL,
	"eleven_labs_agent_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"system_prompt" text NOT NULL,
	"voice_id" varchar(255) DEFAULT 'rachel' NOT NULL,
	"first_message" text,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"assigned_phone_number" varchar(50),
	"knowledge_base_sources" json DEFAULT '[]'::json,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"whatsapp_number" varchar(50),
	"whatsapp_enabled" boolean DEFAULT false NOT NULL,
	"transfer_phone_number" varchar(50),
	"canvas_state" json,
	"enabled_tools" json DEFAULT '[]'::json,
	"steering_instructions" text,
	"admin_whatsapp_number" varchar(50),
	"workspace_id" integer,
	"deployment_status" varchar(20) DEFAULT 'draft' NOT NULL,
	"last_deployed_at" timestamp,
	"twilio_subaccount_sid" varchar(255),
	"twilio_subaccount_token" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"email" varchar(255),
	"company" varchar(255),
	"tags" json DEFAULT '[]'::json,
	"notes" text,
	"last_contacted" timestamp,
	"timezone" varchar(50),
	"status" varchar(50) DEFAULT 'new',
	"lead_score" integer DEFAULT 0,
	"deal_stage" varchar(50) DEFAULT 'prospect',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_memory" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"contact_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"memory_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"source" varchar(50) NOT NULL,
	"source_id" varchar(255),
	"importance" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(255) NOT NULL,
	"language" varchar(10) DEFAULT 'en',
	"voice_speed" varchar(50) DEFAULT 'human',
	"context_memory_window" varchar(50) DEFAULT 'standard',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"hashed_key" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"revoked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "api_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"month" varchar(7) NOT NULL,
	"calls_count" integer DEFAULT 0,
	"tokens_used" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "call_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_sid" varchar(255) NOT NULL,
	"contact_id" integer,
	"contact_phone" varchar(50) NOT NULL,
	"contact_name" varchar(255),
	"agent_config_id" integer,
	"user_id" varchar(255),
	"direction" varchar(50),
	"status" varchar(50) NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL,
	"outcome" varchar(100),
	"recording_url" text,
	"transcript" text,
	"summary" text,
	"tools_called" json DEFAULT '[]'::json,
	"sentiment" varchar(50),
	"lead_score" integer DEFAULT 0,
	"meeting_booked" boolean DEFAULT false,
	"transcript_highlights" json DEFAULT '[]'::json,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "call_logs_call_sid_unique" UNIQUE("call_sid")
);
--> statement-breakpoint
CREATE TABLE "campaign_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer,
	"contact_id" integer,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"call_sid" varchar(255),
	"last_attempt_at" timestamp,
	"attempt_count" integer DEFAULT 0,
	"outcome" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"agent_id" integer,
	"name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"type" varchar(50) DEFAULT 'call' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "configuration_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"configuration_id" integer,
	"version" integer NOT NULL,
	"changes" text,
	"snapshot" json,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "infrastructure_api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"api_key" varchar(255) NOT NULL,
	"name" varchar(255) DEFAULT 'Default Key',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"last_used_at" timestamp,
	CONSTRAINT "infrastructure_api_keys_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "knowledge_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer,
	"type" varchar(50) NOT NULL,
	"source_url" text,
	"file_name" varchar(255),
	"title" varchar(255),
	"status" varchar(50) DEFAULT 'pending',
	"chunks_count" integer DEFAULT 0,
	"last_synced" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pending_decisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"decision_type" varchar(50) NOT NULL,
	"context" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"resolved_by" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "scheduled_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"agent_config_id" integer,
	"task_type" varchar(50) NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"payload" json DEFAULT '{}'::json,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 0,
	"retry_count" integer DEFAULT 0,
	"last_error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255),
	"tier" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"next_billing_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"service" varchar(100) NOT NULL,
	"key_name" varchar(255),
	"encrypted_value" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"role" varchar(50) DEFAULT 'user',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "whatsapp_auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"agent_id" integer,
	"creds" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"contact_id" integer,
	"agent_id" integer,
	"last_message" text,
	"unread_count" integer DEFAULT 0,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer,
	"session_id" varchar(100) NOT NULL,
	"data" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_configurations" ADD CONSTRAINT "agent_configurations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_contact_id_agent_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."agent_contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_agent_config_id_agent_configurations_id_fk" FOREIGN KEY ("agent_config_id") REFERENCES "public"."agent_configurations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_leads" ADD CONSTRAINT "campaign_leads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_leads" ADD CONSTRAINT "campaign_leads_contact_id_agent_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."agent_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_agent_id_agent_configurations_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_versions" ADD CONSTRAINT "configuration_versions_configuration_id_agent_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."agent_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_agent_id_agent_configurations_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_tasks" ADD CONSTRAINT "scheduled_tasks_agent_config_id_agent_configurations_id_fk" FOREIGN KEY ("agent_config_id") REFERENCES "public"."agent_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_auth" ADD CONSTRAINT "whatsapp_auth_agent_id_agent_configurations_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_contact_id_agent_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."agent_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_agent_id_agent_configurations_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_agent_id_agent_configurations_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_configurations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;