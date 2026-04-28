import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

async function verifyAuth(request: Request): Promise<{ uid: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

interface ScrapeRequest {
  url: string;
  agentId?: string;
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, agentId } = await request.json() as ScrapeRequest;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`[Scrape API] Scraping website: ${url} (user: ${user.uid})`);

    // Fetch with 10-second timeout to prevent hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LaunchPixelBot/1.0; +https://launchpixel.in)',
        },
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ error: 'Website took too long to respond (>10s)' }, { status: 408 });
      }
      throw fetchError;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Basic HTML cleaning (remove scripts, styles, and extract text)
    const cleanedText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit to 10k characters

    console.log(`[Scrape API] Extracted ${cleanedText.length} characters from ${url}`);

    // If agentId is provided, update the agent's knowledge base
    if (agentId) {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      
      if (apiKey) {
        try {
          // Add to ElevenLabs Knowledge Base
          // https://elevenlabs.io/docs/api-reference/add-to-agent-knowledge-base
          const kbResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/agents/${agentId}/add-to-knowledge-base`,
            {
              method: 'POST',
              headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: cleanedText,
                source_url: url,
              }),
            }
          );

          if (kbResponse.ok) {
            console.log(`[Scrape API] Added content to agent ${agentId} knowledge base`);
          } else {
            const errorData = await kbResponse.json();
            console.error('[Scrape API] Failed to add to knowledge base:', errorData);
          }
        } catch (kbError) {
          console.error('[Scrape API] Knowledge base update error:', kbError);
          // Don't fail the scrape if KB update fails
        }
      }
    }

    // Extract key sections (basic heuristic)
    const sections = {
      pricing: cleanedText.toLowerCase().includes('pricing') || cleanedText.toLowerCase().includes('price'),
      about: cleanedText.toLowerCase().includes('about us') || cleanedText.toLowerCase().includes('about'),
      services: cleanedText.toLowerCase().includes('services') || cleanedText.toLowerCase().includes('what we do'),
      faq: cleanedText.toLowerCase().includes('faq') || cleanedText.toLowerCase().includes('frequently asked'),
      contact: cleanedText.toLowerCase().includes('contact') || cleanedText.toLowerCase().includes('get in touch'),
    };

    const foundSections = Object.entries(sections)
      .filter(([_, found]) => found)
      .map(([section]) => section.charAt(0).toUpperCase() + section.slice(1));

    return NextResponse.json({
      success: true,
      scraped_text: cleanedText,
      url,
      length: cleanedText.length,
      sections_found: foundSections,
      message: `Successfully scraped content from ${url}. Found: ${foundSections.join(', ')}.`,
      knowledge_base_updated: !!agentId,
    });

  } catch (error: any) {
    console.error('[Scrape API] Failed to scrape:', error);
    return NextResponse.json(
      { error: 'Failed to scrape website', details: error.message },
      { status: 500 }
    );
  }
}
