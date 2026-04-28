import { getDb } from '../db';
import { knowledgeChunks, knowledgeSources } from '../db/schema';
import { generateEmbedding, chunkText } from './embeddings';
import { eq } from 'drizzle-orm';
import { Bindings } from '../index';

/**
 * Indexes a knowledge source by chunking its content and generating embeddings.
 */
export async function indexKnowledgeSource(sourceId: number, content: string, env: Bindings) {
  const db = getDb(env.DATABASE_URL);
  
  try {
    // 1. Update status to processing
    await db.update(knowledgeSources)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(knowledgeSources.id, sourceId));

    // 2. Chunk text
    const chunks = chunkText(content, 1000, 200);
    console.log(`[RAG-Worker] Source ${sourceId}: Split into ${chunks.length} chunks.`);

    // 3. Clear existing chunks for this source (idempotency)
    await db.delete(knowledgeChunks).where(eq(knowledgeChunks.sourceId, sourceId));

    // 4. Generate embeddings and save chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const embedding = await generateEmbedding(chunkContent, env);
      
      await db.insert(knowledgeChunks).values({
        sourceId,
        content: chunkContent,
        embedding: JSON.stringify(embedding), // Storing as JSON string in text column
        metadata: { index: i, total: chunks.length },
        createdAt: new Date()
      });
    }

    // 5. Update source status
    await db.update(knowledgeSources)
      .set({ 
        status: 'completed', 
        chunksCount: chunks.length,
        lastSynced: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(knowledgeSources.id, sourceId));

    console.log(`[RAG-Worker] Source ${sourceId}: Indexing complete.`);
  } catch (error) {
    console.error(`[RAG-Worker] Source ${sourceId}: Indexing failed:`, error);
    await db.update(knowledgeSources)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(knowledgeSources.id, sourceId));
    throw error;
  }
}
