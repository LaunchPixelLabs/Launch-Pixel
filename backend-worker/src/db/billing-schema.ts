import { pgTable, serial, text, integer, timestamp, varchar, json, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- BILLING PLANS ---
export const billingPlans = pgTable('billing_plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  agentLimit: integer('agent_limit').notNull().default(1),
  minuteLimit: integer('minute_limit').notNull().default(100),
  tokenLimit: integer('token_limit').notNull().default(100000),
  features: json('features').default([]),
  priceMonthly: integer('price_monthly').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const billingPlansRelations = relations(billingPlans, ({ many }) => ({
  subscriptions: many(userSubscriptions),
}));

// --- USER SUBSCRIPTIONS ---
export const userSubscriptions = pgTable('user_subscriptions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().unique(),
  planId: integer('plan_id').references(() => billingPlans.id),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  plan: one(billingPlans, {
    fields: [userSubscriptions.planId],
    references: [billingPlans.id],
  }),
}));

// --- USAGE LOGS ---
// Tracks token and minute consumption for billing enforcement
export const billingUsageLogs = pgTable('billing_usage_logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'token', 'minute'
  amount: integer('amount').notNull(),
  agentId: integer('agent_id'),
  timestamp: timestamp('timestamp').defaultNow(),
});
