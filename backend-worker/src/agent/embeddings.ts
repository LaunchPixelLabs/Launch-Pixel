import { Bindings } from '../index';

/**
 * Generates vector embeddings for a given text using the supercharged NVIDIA proxy.
 */
export async function generateEmbedding(text: string, env: Bindings): Promise<number[]> {
  const proxyUrl = 'http://127.0.0.1:1338/v1/embeddings';
  
  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'nvidia/nv-embedqa-e5-v5'
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Embedding failed: ${err}`);
    }

    const data = await res.json() as any;
    return data.data[0].embedding;
  } catch (error) {
    console.error("[Embeddings] Failed to generate embedding:", error);
    throw error;
  }
}

/**
 * Splits text into overlapping chunks for better retrieval context.
 */
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}
