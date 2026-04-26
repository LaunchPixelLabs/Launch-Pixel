import { Hono } from 'hono';
import { apiKeys } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { createCheckoutSession } from './stripe';
import { Bindings } from '../index';

type Variables = {
  apiKey?: string;
}

/**
 * Simple router for billing related endpoints.
 */
export const billingRouter = new Hono<{ Bindings: Bindings, Variables: Variables }>();

// Helper for hashing (Web Crypto API)
async function hashKey(key: string) {
  const msgUint8 = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Middleware to extract API key from header
billingRouter.use('*', async (c, next) => {
  const apiKeyHeader = c.req.header('x-api-key');
  if (apiKeyHeader) {
    c.set('apiKey', apiKeyHeader);
  }
  await next();
});

// POST /keys – generate a new API key for a customer
billingRouter.post('/keys', async (c) => {
  const { customerId } = await c.req.json();
  if (!customerId) return c.json({ error: 'customerId required' }, 400);
  
  const rawKey = crypto.randomUUID();
  const hashedKey = await hashKey(rawKey);

  const db = getDb(c.env.DATABASE_URL);
  await db.insert(apiKeys).values({
    customerId,
    hashedKey,
    revoked: false,
  });
  return c.json({ apiKey: rawKey });
});

import { apiUsage } from '../db/schema';
import { and } from 'drizzle-orm';

// GET /usage – retrieve current usage for the API key
billingRouter.get('/usage', async (c) => {
  const apiKey = c.get('apiKey');
  if (!apiKey) return c.json({ error: 'Missing x-api-key header' }, 401);
  
  const db = getDb(c.env.DATABASE_URL);
  const hashed = await hashKey(apiKey);
  const keyRow = await db.query.apiKeys.findFirst({ where: eq(apiKeys.hashedKey, hashed) });
  
  if (!keyRow) return c.json({ error: 'Invalid API key' }, 403);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const usage = await db.query.apiUsage.findFirst({
    where: and(
      eq(apiUsage.customerId, keyRow.customerId),
      eq(apiUsage.month, currentMonth)
    )
  });

  return c.json({ 
    customerId: keyRow.customerId, 
    callsThisMonth: usage?.callsCount || 0, 
    tokensUsed: usage?.tokensUsed || 0,
    month: currentMonth
  });
});


// POST /checkout – create Stripe Checkout session
billingRouter.post('/checkout', async (c) => {
  const { tier, successUrl, cancelUrl } = await c.req.json();
  if (!tier || !['starter', 'growth'].includes(tier)) return c.json({ error: 'Invalid tier' }, 400);
  
  const sessionUrl = await createCheckoutSession(c.env, tier as 'starter' | 'growth', successUrl, cancelUrl);
  return c.json({ url: sessionUrl });
});
