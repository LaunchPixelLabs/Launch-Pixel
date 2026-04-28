import { Bindings } from '../index';

/**
 * Generates vector embeddings using OpenAI's text-embedding-3-small.
 * Primary: OpenAI (best quality, lowest latency)
 * Fallback: Returns null → triggers keyword search in retrieval layer
 */
export async function generateEmbedding(text: string, env: Bindings): Promise<number[]> {
  const apiKey = (env as any).OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('[Embeddings] No OPENAI_API_KEY set — falling back to keyword search');
    return [];
  }

  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text.slice(0, 8000), // text-embedding-3-small max context
        model: 'text-embedding-3-small',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI embedding failed (${res.status}): ${err}`);
    }

    const data = await res.json() as any;
    return data.data[0].embedding;
  } catch (error) {
    console.error('[Embeddings] Failed to generate embedding:', error);
    // Return empty — let retrieval fall back to keyword search
    return [];
  }
}

/**
 * Splits text into overlapping chunks for better retrieval context.
 * Uses sentence boundary detection for cleaner splits.
 */
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  // Clean the text
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  let start = 0;
  while (start < cleaned.length) {
    let end = Math.min(start + chunkSize, cleaned.length);
    
    // Try to break at sentence boundary
    if (end < cleaned.length) {
      const lastPeriod = cleaned.lastIndexOf('.', end);
      const lastNewline = cleaned.lastIndexOf('\n', end);
      const bestBreak = Math.max(lastPeriod, lastNewline);
      if (bestBreak > start + chunkSize * 0.5) {
        end = bestBreak + 1;
      }
    }
    
    const chunk = cleaned.slice(start, end).trim();
    if (chunk.length > 50) { // Skip tiny fragments
      chunks.push(chunk);
    }
    
    start = end - overlap;
    if (start >= cleaned.length) break;
  }

  return chunks;
}
