import { Hono } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { knowledgeSources } from '../db/schema';
import { indexKnowledgeSource } from '../agent/rag-worker';
import { eq } from 'drizzle-orm';

const scrapeRoutes = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/scrape — Scrape a website URL and ingest into knowledge base
 * Body: { url: string, agentId?: number, userId?: string }
 */
scrapeRoutes.post('/', async (c) => {
  const { url, agentId, userId } = await c.req.json();
  
  if (!url) {
    return c.json({ error: 'URL is required' }, 400);
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return c.json({ error: 'Invalid URL format' }, 400);
  }

  console.log(`[Scrape] Starting scrape of: ${url}`);

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LaunchPixel-Bot/1.0; +https://launchpixel.ai)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      return c.json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }, 422);
    }

    const html = await response.text();
    
    // Extract text from HTML (lightweight, no heavy deps)
    const cleanedText = extractTextFromHTML(html);
    
    if (!cleanedText || cleanedText.length < 50) {
      return c.json({ error: 'Could not extract meaningful content from URL' }, 422);
    }

    console.log(`[Scrape] Extracted ${cleanedText.length} chars from ${url}`);

    // Save to knowledge_sources and trigger indexing
    const db = getDb(c.env.DATABASE_URL);
    const [source] = await db.insert(knowledgeSources).values({
      agentId: agentId ? parseInt(String(agentId)) : 1,
      userId: userId || 'system',
      type: 'url',
      sourceUrl: url,
      title: extractTitle(html) || url,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Trigger background indexing (chunk → embed → store)
    const indexingPromise = indexKnowledgeSource(source.id, cleanedText, c.env);
    indexingPromise.catch(e => console.error('[Scrape] Background indexing failed:', e));

    return c.json({ 
      success: true, 
      source,
      stats: {
        chars: cleanedText.length,
        title: source.title,
      }
    });
  } catch (error: any) {
    console.error('[Scrape] Failed:', error);
    return c.json({ error: `Scrape failed: ${error.message}` }, 500);
  }
});

/**
 * GET /api/knowledge-sources — List all knowledge sources
 */
scrapeRoutes.get('/sources', async (c) => {
  try {
    const db = getDb(c.env.DATABASE_URL);
    const sources = await db.query.knowledgeSources.findMany({
      orderBy: (ks, { desc }) => [desc(ks.createdAt)],
    });
    return c.json({ success: true, sources });
  } catch (error: any) {
    console.error('[Knowledge] Failed to list sources:', error);
    return c.json({ success: true, sources: [] });
  }
});

/**
 * DELETE /api/knowledge-sources/:id — Delete a knowledge source
 */
scrapeRoutes.delete('/sources/:id', async (c) => {
  const { id } = c.req.param();
  try {
    const db = getDb(c.env.DATABASE_URL);
    await db.delete(knowledgeSources).where(eq(knowledgeSources.id, parseInt(id)));
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ── Helpers ──

function extractTextFromHTML(html: string): string {
  // Remove script, style, nav, footer, header tags and their content
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace block elements with newlines
    .replace(/<(?:br|p|div|h[1-6]|li|tr|dt|dd|blockquote)[^>]*>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
    // Clean whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Limit to 100K chars
  return text.slice(0, 100000);
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (match?.[1]) {
    return match[1].replace(/<[^>]+>/g, '').trim().slice(0, 200);
  }
  return null;
}

export default scrapeRoutes;
