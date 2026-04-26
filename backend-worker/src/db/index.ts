import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as billingSchema from './billing-schema';

export function getDb(connectionString: string, isFinancial: boolean = false) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing');
  }
  const sql = neon(connectionString);
  const activeSchema = isFinancial ? { ...schema, ...billingSchema } : schema;
  return drizzle(sql, { schema: activeSchema });
}

