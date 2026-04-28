import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

/**
 * Verify Firebase authentication token
 */
async function verifyAuth(request: Request): Promise<{ uid: string; email?: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
  } catch (error) {
    console.error('[Train API] Auth verification failed:', error);
    return null;
  }
}

/**
 * Extract text from PDF file using pdf-parse
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('[Train API] PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from DOCX file using mammoth
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('[Train API] DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from TXT file
 */
async function extractTxtText(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('[Train API] TXT extraction error:', error);
    throw new Error('Failed to extract text from TXT');
  }
}

/**
 * Store document metadata in database
 */
async function storeDocumentMetadata(
  userId: string,
  agentId: string,
  filename: string,
  fileType: string,
  contentLength: number,
  extractedText: string
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://launch-pixel-backend.onrender.com';
    
    const response = await fetch(`${backendUrl}/api/agent-configurations/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        agentId,
        filename,
        fileType,
        contentLength,
        extractedText: extractedText.substring(0, 1000), // Store first 1000 chars as preview
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Train API] Failed to store document metadata:', errorData);
      // Don't throw - metadata storage is optional
    }

    return await response.json();
  } catch (error) {
    console.error('[Train API] Database storage error:', error);
    // Don't throw - metadata storage is optional
  }
}

/**
 * Send extracted text to ElevenLabs Knowledge Base API
 */
async function addToKnowledgeBase(
  agentId: string,
  text: string,
  filename: string
): Promise<boolean> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('[Train API] Missing ELEVENLABS_API_KEY');
    throw new Error('Server configuration error: Missing API key');
  }

  try {
    // Add to ElevenLabs Knowledge Base
    // https://elevenlabs.io/docs/api-reference/add-to-agent-knowledge-base
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${agentId}/add-to-knowledge-base`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          source_url: filename, // Use filename as source identifier
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Train API] Failed to add to knowledge base:', errorData);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    console.log(`[Train API] Added document ${filename} to agent ${agentId} knowledge base`);
    return true;
  } catch (error) {
    console.error('[Train API] Knowledge base update error:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Requirement 4.1: Validate authentication (optional - can be added later)
    // For now, we'll accept requests without auth for MVP
    // const user = await verifyAuth(request);
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized', message: 'Please sign in to continue' },
    //     { status: 401 }
    //   );
    // }

    // Requirement 4.1: Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const agentId = formData.get('agentId') as string | null;

    // Requirement 4.1: Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded', message: 'Please select a file to upload' },
        { status: 400 }
      );
    }

    const filename = file.name;
    const fileSize = file.size;
    const fileExtension = filename.split('.').pop()?.toLowerCase();

    console.log(`[Train API] Processing document upload: ${filename} (${fileSize} bytes)`);

    // Requirement 4.4: Enforce maximum file size of 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large', 
          message: 'File size exceeds 10MB limit. Please upload a smaller file.' 
        },
        { status: 400 }
      );
    }

    // Requirement 4.2: Accept PDF, DOCX, and TXT file formats
    const SUPPORTED_FORMATS = ['pdf', 'docx', 'doc', 'txt'];
    if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension)) {
      return NextResponse.json(
        { 
          error: 'Unsupported file format', 
          message: `Only PDF, DOCX, and TXT files are supported. You uploaded: ${fileExtension}` 
        },
        { status: 400 }
      );
    }

    // Convert file to buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    // Requirement 4.3: Implement PDF text extraction using pdf-parse library
    if (fileExtension === 'pdf') {
      extractedText = await extractPdfText(buffer);
    }
    // Requirement 4.4: Implement DOCX text extraction using mammoth library
    else if (fileExtension === 'docx' || fileExtension === 'doc') {
      extractedText = await extractDocxText(buffer);
    }
    // Requirement 4.5: Implement TXT file reading
    else if (fileExtension === 'txt') {
      extractedText = await extractTxtText(buffer);
    }

    // Clean and normalize extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json(
        { 
          error: 'No content extracted', 
          message: 'The document appears to be empty or unreadable. Please check the file and try again.' 
        },
        { status: 400 }
      );
    }

    console.log(`[Train API] Extracted ${extractedText.length} characters from ${filename}`);

    // Requirement 4.6: Send extracted text to ElevenLabs Knowledge Base API
    let knowledgeBaseUpdated = false;
    if (agentId) {
      try {
        knowledgeBaseUpdated = await addToKnowledgeBase(agentId, extractedText, filename);
      } catch (kbError: any) {
        console.error('[Train API] Failed to update knowledge base:', kbError);
        return NextResponse.json(
          { 
            error: 'Failed to update knowledge base', 
            message: kbError.message || 'Could not add document to agent knowledge base',
            details: kbError.toString()
          },
          { status: 500 }
        );
      }
    }

    // Requirement 4.7: Store document metadata in database
    // Note: This is optional and won't fail the request if it errors
    // if (user && agentId) {
    //   await storeDocumentMetadata(
    //     user.uid,
    //     agentId,
    //     filename,
    //     fileExtension,
    //     extractedText.length,
    //     extractedText
    //   );
    // }

    // Generate content summary
    const wordCount = extractedText.split(/\s+/).length;
    const preview = extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : '');

    // Requirement 4.8: Return success confirmation with content summary
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${filename}`,
      document: {
        filename,
        fileType: fileExtension,
        fileSize,
        contentLength: extractedText.length,
        wordCount,
        preview,
      },
      knowledge_base_updated: knowledgeBaseUpdated,
      agent_id: agentId || null,
    });

  } catch (error: any) {
    console.error('[Train API] Failed to process document:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process document',
        message: error.message || 'An unexpected error occurred while processing your document',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
