import { pgTable, serial, text, integer, timestamp, boolean, json, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
export * from './billing-schema';

// --- USERS ---
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).notNull().unique(), // Firebase UID
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  agentProfiles: many(agentProfiles),
  agentConfigurations: many(agentConfigurations),
  workspaceMemberships: many(workspaceMembers),
}));

// --- WORKSPACES (Team Collaboration) ---
export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(), // The UID of the person who owns the workspace
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workspaceMembers = pgTable('workspace_members', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(), // The UID of the invited member
  role: varchar('role', { length: 50 }).default('member'), // 'admin', 'member', 'viewer'
  createdAt: timestamp('created_at').defaultNow(),
});

// --- AGENT PROFILES ---
export const agentProfiles = pgTable('agent_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  language: varchar('language', { length: 10 }).default('en'),
  voiceSpeed: varchar('voice_speed', { length: 50 }).default('human'),
  contextMemoryWindow: varchar('context_memory_window', { length: 50 }).default('standard'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- AGENT CONFIGURATIONS ---
export const agentConfigurations = pgTable('agent_configurations', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // using Firebase UID directly as per Sequelize schema
  agentType: varchar('agent_type', { length: 50 }).notNull(), // 'outbound', 'inbound'
  role: varchar('role', { length: 50 }).notNull().default('custom'),
  elevenLabsAgentId: varchar('eleven_labs_agent_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  systemPrompt: text('system_prompt').notNull(),
  voiceId: varchar('voice_id', { length: 255 }).notNull().default('rachel'),
  firstMessage: text('first_message'),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  assignedPhoneNumber: varchar('assigned_phone_number', { length: 50 }),
  knowledgeBaseSources: json('knowledge_base_sources').default([]),
  version: integer('version').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  whatsappEnabled: boolean('whatsapp_enabled').notNull().default(false),
  transferPhoneNumber: varchar('transfer_phone_number', { length: 50 }),
  canvasState: json('canvas_state'),
  enabledTools: json('enabled_tools').default([]),
  steeringInstructions: text('steering_instructions'),
  adminWhatsAppNumber: varchar('admin_whatsapp_number', { length: 50 }),
  
  // Workspace Context
  workspaceId: integer('workspace_id').references(() => workspaces.id, { onDelete: 'set null' }),
  
  // Deployment Pipeline
  deploymentStatus: varchar('deployment_status', { length: 20 }).notNull().default('draft'), // 'draft', 'test', 'production'
  lastDeployedAt: timestamp('last_deployed_at'),
  
  // Multi-Tenant Isolation
  twilioSubaccountSid: varchar('twilio_subaccount_sid', { length: 255 }),
  twilioSubaccountToken: varchar('twilio_subaccount_token', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentConfigurationsRelations = relations(agentConfigurations, ({ one, many }) => ({
  user: one(users, {
    fields: [agentConfigurations.userId],
    references: [users.uid],
  }),
  versions: many(configurationVersions),
}));

// --- CONFIGURATION VERSIONS ---
export const configurationVersions = pgTable('configuration_versions', {
  id: serial('id').primaryKey(),
  configurationId: integer('configuration_id').references(() => agentConfigurations.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  changes: text('changes'),
  snapshot: json('snapshot'),
  createdBy: varchar('created_by', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- AGENT CONTACTS ---
export const agentContacts = pgTable('agent_contacts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }),
  company: varchar('company', { length: 255 }),
  tags: json('tags').default([]),
  notes: text('notes'),
  lastContacted: timestamp('last_contacted'),
  timezone: varchar('timezone', { length: 50 }),
  status: varchar('status', { length: 50 }).default('new'),
  leadScore: integer('lead_score').default(0),
  dealStage: varchar('deal_stage', { length: 50 }).default('prospect'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const agentMemory = pgTable('agent_memory', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull(),
  contactId: integer('contact_id').notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  memoryType: varchar('memory_type', { length: 50 }).notNull(), // 'fact', 'preference', 'objection', 'commitment', 'relationship'
  content: text('content').notNull(),
  source: varchar('source', { length: 50 }).notNull(), // 'call', 'whatsapp', 'manual'
  sourceId: varchar('source_id', { length: 255 }), // callSid or messageId
  importance: integer('importance').default(5), // 1-10
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pendingDecisions = pgTable('pending_decisions', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  decisionType: varchar('decision_type', { length: 50 }).notNull(), // 'discount_approval', 'custom_offer', 'escalation'
  context: text('context').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'approved', 'denied'
  requestedAt: timestamp('requested_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: varchar('resolved_by', { length: 50 }), // 'owner_whatsapp', 'dashboard'
});

export const agentContactsRelations = relations(agentContacts, ({ many }) => ({
  callLogs: many(callLogs),
}));

// --- CALL LOGS ---
export const callLogs = pgTable('call_logs', {
  id: serial('id').primaryKey(),
  callSid: varchar('call_sid', { length: 255 }).notNull().unique(),
  contactId: integer('contact_id').references(() => agentContacts.id, { onDelete: 'set null' }),
  contactPhone: varchar('contact_phone', { length: 50 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  agentConfigId: integer('agent_config_id').references(() => agentConfigurations.id, { onDelete: 'set null' }),
  userId: varchar('user_id', { length: 255 }),
  direction: varchar('direction', { length: 50 }), // 'inbound', 'outbound'
  status: varchar('status', { length: 50 }).notNull(), // 'completed', 'failed', 'busy', 'no-answer'
  duration: integer('duration').notNull().default(0), // seconds
  outcome: varchar('outcome', { length: 100 }), // 'interested', 'not-interested', 'follow-up', 'meeting-booked'
  recordingUrl: text('recording_url'),
  transcript: text('transcript'),
  summary: text('summary'),
  toolsCalled: json('tools_called').default([]),
  // Intelligence & Analytics
  sentiment: varchar('sentiment', { length: 50 }), // 'positive', 'neutral', 'negative'
  leadScore: integer('lead_score').default(0), // 0-100
  meetingBooked: boolean('meeting_booked').default(false),
  transcriptHighlights: json('transcript_highlights').default([]),
  
  timestamp: timestamp('timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const callLogsRelations = relations(callLogs, ({ one }) => ({
  contact: one(agentContacts, {
    fields: [callLogs.contactId],
    references: [agentContacts.id],
  }),
  agentConfiguration: one(agentConfigurations, {
    fields: [callLogs.agentConfigId],
    references: [agentConfigurations.id],
  }),
}));

// --- WHATSAPP CONVERSATIONS (Persistent Thread Tracking) ---
export const whatsappConversations = pgTable('whatsapp_conversations', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  contactId: integer('contact_id').references(() => agentContacts.id, { onDelete: 'cascade' }),
  agentId: integer('agent_id').references(() => agentConfigurations.id, { onDelete: 'cascade' }),
  lastMessage: text('last_message'),
  unreadCount: integer('unread_count').default(0),
  metadata: json('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- KNOWLEDGE SOURCES ---
export const knowledgeSources = pgTable('knowledge_sources', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agentConfigurations.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }),
  type: varchar('type', { length: 50 }).notNull(), // 'url', 'pdf', 'txt'
  sourceUrl: text('source_url'),
  fileName: varchar('file_name', { length: 255 }),
  title: varchar('title', { length: 255 }),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
  chunksCount: integer('chunks_count').default(0),
  lastSynced: timestamp('last_synced'),
  lastIndexedAt: timestamp('last_indexed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- KNOWLEDGE CHUNKS (RAG Vector Store) ---
export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').references(() => knowledgeSources.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  embedding: text('embedding'), // Fallback if vector type is not available in current drizzle version
  metadata: json('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- SYSTEM CREDENTIALS ---
export const systemCredentials = pgTable('system_credentials', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  service: varchar('service', { length: 100 }).notNull(), // 'twilio', 'elevenlabs', 'stripe'
  keyName: varchar('key_name', { length: 255 }),
  encryptedValue: text('encrypted_value').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- BILLING TABLES ---
export const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  customerId: varchar('customer_id', { length: 255 }).notNull(),
  hashedKey: varchar('hashed_key', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  revoked: boolean('revoked').default(false),
});

export const infrastructureApiKeys = pgTable('infrastructure_api_keys', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  apiKey: varchar('api_key', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).default('Default Key'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  customerId: varchar('customer_id', { length: 255 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  tier: varchar('tier', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  nextBillingDate: timestamp('next_billing_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const apiUsage = pgTable('api_usage', {
  id: serial('id').primaryKey(),
  customerId: varchar('customer_id', { length: 255 }).notNull(),
  month: varchar('month', { length: 7 }).notNull(), // 'YYYY-MM'
  callsCount: integer('calls_count').default(0),
  tokensUsed: integer('tokens_used').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});


// --- SCHEDULED TASKS ---
export const scheduledTasks = pgTable('scheduled_tasks', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  agentConfigId: integer('agent_config_id').references(() => agentConfigurations.id, { onDelete: 'cascade' }),
  taskType: varchar('task_type', { length: 50 }).notNull(), // 'outbound_call', 'whatsapp_message', 'webhook_dispatch'
  scheduledFor: timestamp('scheduled_for').notNull(),
  payload: json('payload').default({}),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'completed', 'failed', 'cancelled'
  priority: integer('priority').default(0),
  retryCount: integer('retry_count').default(0),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const scheduledTasksRelations = relations(scheduledTasks, ({ one }) => ({
  agentConfiguration: one(agentConfigurations, {
    fields: [scheduledTasks.agentConfigId],
    references: [agentConfigurations.id],
  }),
}));

// --- CAMPAIGNS ---
export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  agentId: integer('agent_id').references(() => agentConfigurations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // 'draft', 'active', 'paused', 'completed'
  type: varchar('type', { length: 50 }).notNull().default('call'), // 'call', 'whatsapp'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const campaignLeads = pgTable('campaign_leads', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),
  contactId: integer('contact_id').references(() => agentContacts.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'contacted', 'failed', 'converted'
  callSid: varchar('call_sid', { length: 255 }),
  lastAttemptAt: timestamp('last_attempt_at'),
  attemptCount: integer('attempt_count').default(0),
  outcome: text('outcome'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  agent: one(agentConfigurations, {
    fields: [campaigns.agentId],
    references: [agentConfigurations.id],
  }),
  leads: many(campaignLeads),
}));

export const campaignLeadsRelations = relations(campaignLeads, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignLeads.campaignId],
    references: [campaigns.id],
  }),
  contact: one(agentContacts, {
    fields: [campaignLeads.contactId],
    references: [agentContacts.id],
  }),
}));
// --- WHATSAPP AUTHENTICATION (Baileys Persistence) ---
export const whatsappAuth = pgTable('whatsapp_auth', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  agentId: integer('agent_id').references(() => agentConfigurations.id, { onDelete: 'cascade' }),
  creds: text('creds').notNull(), // JSON string of Baileys credentials
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const whatsappSessions = pgTable('whatsapp_sessions', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agentConfigurations.id, { onDelete: 'cascade' }),
  sessionId: varchar('session_id', { length: 100 }).notNull(), // e.g. "auth_key"
  data: text('data').notNull(), // JSON string of session data
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const whatsappAuthRelations = relations(whatsappAuth, ({ one }) => ({
  agent: one(agentConfigurations, {
    fields: [whatsappAuth.agentId],
    references: [agentConfigurations.id],
  }),
}));
